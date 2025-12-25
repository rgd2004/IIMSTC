// server/controllers/orderController.js

const Order = require("../models/Order");
const Service = require("../models/Service");
const User = require("../models/User");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const {
  sendOrderConfirmationEmail,
  sendAdminOrderEmail,
  sendOrderStatusEmail,
} = require("../utils/email");

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* -------------------------------------------------------
   1️⃣ CREATE ORDER
-------------------------------------------------------- */
exports.createOrder = async (req, res) => {
  try {
    console.log("\n🔵 ========== ORDER CREATION START ==========");
    console.log("🔍 RAW REQUEST BODY:", JSON.stringify(req.body, null, 2));
    
    const { serviceId, quantity, totalPrice, customerDetails } = req.body;
    const userId = req.user._id;

    console.log("📝 Request received:", { 
      serviceId: serviceId ? `✅ ${serviceId}` : "❌ MISSING",
      totalPrice: totalPrice ? `✅ ${totalPrice}` : "❌ MISSING",
      quantity: quantity || 1,
      userId: userId ? `✅ ${userId}` : "❌ MISSING",
      customerDetails: customerDetails ? "✅ Present" : "❌ Missing",
    });

    // === VALIDATION ===
    if (!serviceId || !totalPrice) {
      const error = `Missing: ${!serviceId ? 'serviceId ' : ''}${!totalPrice ? 'totalPrice' : ''}`;
      console.error("❌ VALIDATION FAILED:", error);
      return res.status(400).json({ 
        success: false, 
        message: "Service ID and total price are required" 
      });
    }

    if (totalPrice <= 0) {
      console.error("❌ INVALID AMOUNT:", totalPrice);
      return res.status(400).json({ 
        success: false, 
        message: "Total price must be greater than 0" 
      });
    }

    // === SERVICE LOOKUP ===
    console.log("🔍 Looking up service:", serviceId);
    const service = await Service.findById(serviceId);
    if (!service) {
      console.error("❌ SERVICE NOT FOUND - ID:", serviceId);
      console.error("   Searched in database but no match");
      return res.status(404).json({ 
        success: false, 
        message: `Service not found (ID: ${serviceId})` 
      });
    }
    console.log("✅ Service found:", `"${service.name}" (Category: ${service.category})`);

    // === RAZORPAY CONFIG ===
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error("❌ RAZORPAY CONFIG MISSING:");
      console.error("   - KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✅" : "❌");
      console.error("   - SECRET:", process.env.RAZORPAY_SECRET ? "✅" : "❌");
      return res.status(500).json({ 
        success: false, 
        message: "Payment gateway not configured. Contact support." 
      });
    }
    console.log("✅ Razorpay configured (Key:", process.env.RAZORPAY_KEY_ID.substring(0, 10) + "...)");

    // === RAZORPAY ORDER ===
    const amountInPaise = Math.round(totalPrice * 100);
    console.log("💳 Creating Razorpay order:", `₹${totalPrice} → ${amountInPaise} paise`);
    
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: "rcpt_" + Date.now(),
      });
      console.log("✅ Razorpay order created:", rzpOrder.id);
    } catch (rzpErr) {
      console.error("❌ RAZORPAY API ERROR:", rzpErr.message);
      console.error("   Ensure credentials are valid test/live keys");
      return res.status(500).json({ 
        success: false, 
        message: "Payment gateway error: " + rzpErr.message 
      });
    }

    // === DATABASE ORDER ===
    console.log("💾 Saving order to database...");
    let newOrder;
    try {
      newOrder = await Order.create({
        userId,
        service: serviceId,
        quantity: quantity || 1,
        amount: totalPrice,
        razorpayOrderId: rzpOrder.id,
        paymentStatus: "pending",
        status: "pending",
        customerDetails: customerDetails || {},
      });
      console.log("✅ Order saved:", newOrder._id);
    } catch (dbErr) {
      console.error("❌ DATABASE ERROR:", dbErr.message);
      if (dbErr.errors) {
        console.error("   Validation errors:", Object.keys(dbErr.errors));
      }
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + dbErr.message 
      });
    }

    // === SUCCESS ===
    console.log("🎉 ORDER CREATION COMPLETE");
    console.log("🔵 ========== ORDER CREATION END ==========\n");

    return res.json({
      success: true,
      order: {
        _id: newOrder._id,
        razorpayOrderId: rzpOrder.id,
        amount: totalPrice,
        currency: "INR",
      },
    });
  } catch (err) {
    console.error("\n❌ ========== UNEXPECTED ERROR ==========");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    console.error("Type:", err.constructor.name);
    console.error("🔵 ========== END ERROR ==========\n");
    
    res.status(500).json({ 
      success: false, 
      message: `Order creation failed: ${err.message}` 
    });
  }
};

/* -------------------------------------------------------
   2️⃣ VERIFY PAYMENT + SEND EMAILS
-------------------------------------------------------- */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const order = await Order.findOne({ razorpayOrderId })
      .populate("service")
      .populate("userId", "name email referredBy");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.status = "processing";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    /* -------------------------------------------------------
       🔥 REFERRAL REWARD LOGIC (₹50)
    -------------------------------------------------------- */
    if (order.userId?.referredBy) {
      try {
        const refUser = await User.findOne({ referralCode: order.userId.referredBy });
        if (refUser) {
          refUser.referralEarnings += 50;
          await refUser.save();
          console.log("💰 Referral reward added to:", refUser.email);
        }
      } catch (err) {
        console.error("Referral error:", err);
      }
    }

    /* -------------------------------------------------------
       ✔ USER EMAIL
    -------------------------------------------------------- */
    const userEmail =
      order.userId?.email ||
      order.customerDetails?.email ||
      null;

    const serviceName = order.service.name || order.service.title || "Service";

    if (userEmail) {
      try {
        await sendOrderConfirmationEmail(userEmail, {
          orderId: order._id,
          serviceName,
          packageType: order.customerDetails.packageType || "Standard",
          amount: order.amount,
          deliveryTime: order.service.deliveryTime || "24–48 hours",
        });
        console.log("📧 Confirmation email →", userEmail);
      } catch (err) {
        console.error("❌ Confirmation email failed:", err);
      }
    } else {
      console.error("❌ No email available for confirmation message");
    }

    /* -------------------------------------------------------
       ✔ ADMIN EMAIL
    -------------------------------------------------------- */
    try {
      await sendAdminOrderEmail({
        orderId: order._id,
        serviceName,
        packageType: order.customerDetails.packageType || "Standard",
        amount: order.amount,
        quantity: order.quantity,
        paymentId: order.razorpayPaymentId,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        customerDetails: order.customerDetails,
      });
      console.log("📧 Admin email sent");
    } catch (err) {
      console.error("❌ Admin email failed:", err);
    }

    return res.json({
      success: true,
      message: "Payment verified!",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

/* -------------------------------------------------------
   3️⃣ GET USER ORDERS
-------------------------------------------------------- */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("service")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

/* -------------------------------------------------------
   4️⃣ GET ALL ORDERS (ADMIN)
-------------------------------------------------------- */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("service")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

/* -------------------------------------------------------
   EXPORT ORDERS AS CSV (ADMIN)
-------------------------------------------------------- */
exports.exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("service", "name serviceId")
      .sort({ createdAt: -1 });

    const headers = [
      "OrderID",
      "CreatedAt",
      "UserID",
      "UserName",
      "UserEmail",
      "UserPhone",
      "ServiceID",
      "ServiceName",
      "Amount",
      "Quantity",
      "PaymentStatus",
      "Status",
      "CustomerName",
      "CustomerEmail",
      "CustomerPhone",
      "CustomerLink",
      "CustomerRequirements",
    ];

    const escape = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    let csv = headers.join(",") + "\n";

    for (const o of orders) {
      const row = [
        o._id,
        o.createdAt?.toISOString(),
        o.userId?._id || "",
        o.userId?.name || "",
        o.userId?.email || o.customerDetails?.email || "",
        o.userId?.phone || o.customerDetails?.phone || "",
        o.service?.serviceId || "",
        o.service?.name || "",
        o.amount || 0,
        o.quantity || 0,
        o.paymentStatus || "",
        o.status || "",
        o.customerDetails?.name || "",
        o.customerDetails?.email || "",
        o.customerDetails?.phone || "",
        o.customerDetails?.link || "",
        o.customerDetails?.requirements || "",
      ];

      csv += row.map(escape).join(",") + "\n";
    }

    const fileName = `orders-${new Date().toISOString().slice(0,10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error("Export CSV error:", err);
    res.status(500).json({ success: false, message: "Failed to export orders" });
  }
};

/* -------------------------------------------------------
   5️⃣ GET SINGLE ORDER
-------------------------------------------------------- */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("service")
      .populate("userId", "name email phone");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const isOwner = order.userId._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ success: false, message: "Failed to load order details" });
  }
};

/* -------------------------------------------------------
   6️⃣ UPDATE ORDER STATUS + EMAIL USER
-------------------------------------------------------- */
exports.updateOrderStatus = async (req, res) => {
  try {
    console.log('📦 updateOrderStatus called:');
    console.log('  - Order ID:', req.params.id);
    console.log('  - New Status:', req.body.status);
    console.log('  - Admin:', req.user?.isAdmin);
    
    const order = await Order.findById(req.params.id)
      .populate("service")
      .populate("userId", "name email");

    if (!order) {
      console.error('❌ Order not found:', req.params.id);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(req.body.status)) {
      console.error('❌ Invalid status:', req.body.status);
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    order.status = req.body.status;
    await order.save();
    console.log('✅ Order status updated to:', req.body.status);

    /* -------------------------------------------------------
       ✔ EMAIL FINDER
    -------------------------------------------------------- */
    const userEmail =
      order.userId?.email ||
      order.customerDetails?.email ||
      null;

    const serviceName = order.service?.name || order.service?.title || "Service";

    if (userEmail) {
      try {
        await sendOrderStatusEmail(userEmail, {
          name: order.userId?.name || order.customerDetails?.name || "Customer",
          orderId: order._id,
          serviceName,
          status: order.status,
        });
        console.log("📧 Status update email →", userEmail);
      } catch (err) {
        console.error("❌ Status update email failed:", err);
      }
    } else {
      console.error("❌ No email found for status update email");
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Status update error:", err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};
