// ================================================
// FINAL CHECKOUT PAGE — FULLY FIXED WITH EMAIL FLOW
// ================================================

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../utils/api";
import { servicesAPI, ordersAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [photos, setPhotos] = useState([]);

  // 🎟️ COUPON SYSTEM
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // EMAIL FIX ADDED ✔
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "", // <-- REQUIRED
    link: "",
    quantity: 1,
    requirements: "",
    businessName: "",
    businessCategory: "",
    mapLocation: "",
    address: "",
    workingHours: "",
    website: "",
  });

  // ======================================================
  // FETCH SERVICE
  // ======================================================
  const fetchService = useCallback(async () => {
    try {
      const response = await servicesAPI.getService(serviceId);
      setService(response.data.service);
    } catch {
      toast.error("Failed to load service");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  }, [serviceId, navigate]);

  useEffect(() => {
    fetchService();

    // Load Razorpay only once
    if (!document.getElementById("rzp-script")) {
      const script = document.createElement("script");
      script.id = "rzp-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [fetchService]);

  // ======================================================
  // FORM HANDLERS
  // ======================================================
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onPhotoSelect = (e) => setPhotos([...e.target.files]);

  // ======================================================
  // 🎟️ COUPON VALIDATION
  // ======================================================
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);
      const response = await API.post("/coupons/validate", {
        code: couponCode.toUpperCase(),
        orderAmount: originalTotal,
        serviceId: serviceId,
      });

      const { discountAmount: discount, couponId } = response.data.data;
      setDiscountAmount(discount);
      setAppliedCoupon({ code: couponCode.toUpperCase(), couponId });
      toast.success(`💰 Coupon applied! Discount: ₹${discount}`);
      setCouponCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // ======================================================
  // PRICE CALCULATION WITH GST
  // ======================================================
  const GST_RATE = 0.18; // 18% GST
  
  const calculateTotal = () => {
    if (!service) return 0;
    
    const qty = Number(formData.quantity) || 1;

    if (service.pricePerUnit > 0) return service.pricePerUnit * qty;
    if (service.pricePer1000 > 0) return (service.pricePer1000 / 1000) * qty;

    return service.unitPrice * qty;
  };

  const originalTotal = calculateTotal();
  const gstAmount = Math.round(originalTotal * GST_RATE);
  const totalWithGst = originalTotal + gstAmount;
  const finalTotal = Math.max(0, totalWithGst - discountAmount);

  // ======================================================
  // SERVICE TYPES
  // ======================================================
  const c = service?.category?.toLowerCase() || "";
  const serviceName = service?.name?.toLowerCase() || "";

  const isSocialMedia = [
    "instagram",
    "facebook",
    "youtube",
    "twitter",
    "telegram",
    "reviews",
    "seo",
    "gmb",  // ✅ Added GMB category
  ].includes(c);

  const isGmbSocial = [
    "gmb ranking signals",
    "gmb saves",
    "gmb profile visits",
    "gmb full setup",  // ✅ Added full setup to social
  ].includes(serviceName);

  const isWebsite = c === "website";
  const isGmbFullSetup = serviceName === "gmb full setup";

  // ======================================================
  // VALIDATION
  // ======================================================
  const validate = () => {
    if (!formData.email) {
      toast.error("Your email is missing.");
      return false;
    }

    // ✅ GMB Full Setup validation (separate from social media)
    if (isGmbFullSetup) {
      if (!formData.businessName) return toast.error("Enter business name");
      if (!formData.businessCategory) return toast.error("Enter business category");
      if (!formData.mapLocation) return toast.error("Enter map link");
      if (!formData.address) return toast.error("Enter full address");
      return true;  // ✅ Early return for GMB Full Setup
    }

    // ✅ Social Media & Regular GMB services
    if (isSocialMedia || isGmbSocial) {
      if (!formData.name) return toast.error("Enter your name");
      if (!formData.phone) return toast.error("Enter your phone number");
      if (!formData.link) return toast.error("Enter your link/profile");
    }

    if (isWebsite) {
      if (!formData.name) return toast.error("Enter your name");
      if (!formData.phone) return toast.error("Enter your phone number");
      if (!formData.requirements)
        return toast.error("Enter your requirements");
    }

    return true;
  };

  // ======================================================
  // PAYMENT HANDLER
  // ======================================================
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);

    try {
      console.log("\n🔵 ========== PAYMENT HANDLER START ==========");
      console.log("🔍 Component State:", {
        serviceId: serviceId ? `✅ ${serviceId}` : "❌ MISSING",
        service: service ? `✅ ${service.name}` : "❌ Not loaded",
        finalTotal: finalTotal || "❌ MISSING",
        formData: formData,
        isGmbFullSetup,
        photos: photos.length,
      });

      console.log("📝 Creating order with payload:", { serviceId, finalTotal, isGmbFullSetup });

      const payload = {
        serviceId,
        quantity: Number(formData.quantity) || 1,
        totalPrice: finalTotal,
        originalPrice: originalTotal,
        gstAmount: gstAmount,
        gstRate: GST_RATE,
        discountAmount: discountAmount,
        couponId: appliedCoupon?.couponId || null,
        customerDetails: {
          ...formData,
          email: formData.email, // REQUIRED FOR EMAIL SENDING
        },
      };

      console.log("📦 Payload to send:", payload);
      console.log("📦 Payload JSON size:", JSON.stringify(payload).length, "bytes");

      let response;

      // ✅ Send FormData with photos if GMB Full Setup and photos exist
      if (isGmbFullSetup && photos.length > 0) {
        console.log("📸 Sending with photos:", photos.length);
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        photos.forEach((file) => fd.append("photos", file));
        response = await ordersAPI.createOrderFormData(fd);
      } else {
        // ✅ Send regular JSON request (works for GMB Full Setup without photos too)
        console.log("📤 Sending JSON payload to /api/orders/create");
        console.log("   Content-Type: application/json");
        response = await ordersAPI.createOrder(payload);
      }

      console.log("✅ Order created:", response.data);

      const { order } = response.data;

      if (!order || !order.razorpayOrderId) {
        console.error("❌ Invalid order response:", response.data);
        toast.error("Invalid order response from server");
        setProcessing(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: finalTotal * 100,
        currency: "INR",
        order_id: order.razorpayOrderId,
        name: "PKC CAG",
        description: service.name,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#6366f1" },

        handler: async function (resp) {
          try {
            const verify = await ordersAPI.verifyPayment({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });

            if (verify.data.success) {
              toast.success("🎉 Payment Successful!");
              setTimeout(() => toast.success("🛒 Order Placed Successfully!"), 500);
              setTimeout(() => navigate("/dashboard"), 1200);
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            toast.error("Payment verification failed: " + (err.response?.data?.message || err.message));
          }
        },
      };

      console.log("🔑 Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY_ID ? "✅ SET" : "❌ NOT SET");
      new window.Razorpay(options).open();
    } catch (err) {
      console.error("❌ Order creation error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Order creation failed";
      toast.error(errorMsg);
    }

    setProcessing(false);
  };

  // ======================================================
  // RENDER
  // ======================================================
  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout — {service.name}</h1>

        <div className="checkout-grid">
          {/* ORDER SUMMARY */}
          <div className="order-summary glass-card">
            <h2>Order Summary</h2>

            <div className="summary-card">
              <h3>{service.name}</h3>

              <div className="price-row">
                <span>Unit Price</span>
                <span>₹{service.unitPrice}</span>
              </div>

              {!isWebsite && !isGmbFullSetup && (
                <div className="price-row">
                  <span>Quantity</span>
                  <span>{formData.quantity}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Subtotal</span>
                <span>₹{originalTotal.toLocaleString()}</span>
              </div>

              <div className="price-row gst">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>

              <div className="price-row total-with-gst">
                <span>Total (with GST)</span>
                <span>₹{totalWithGst.toLocaleString()}</span>
              </div>

              {/* 🎟️ COUPON SECTION */}
              <div className="coupon-section">
                {!appliedCoupon ? (
                  <>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleValidateCoupon()}
                      />
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || !couponCode}
                        className="btn-apply-coupon"
                      >
                        {validatingCoupon ? "Validating..." : "Apply"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="coupon-applied">
                    <span className="coupon-badge">✓ {appliedCoupon.code} Applied</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="btn-remove-coupon"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="price-row discount">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="price-row final-total">
                <span>Final Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              <p className="delivery">🚚 Delivery: {service.deliveryTime}</p>
            </div>
          </div>

          {/* FORM */}
          <div className="checkout-form glass-card">
            <h2>Your Details</h2>

            <form onSubmit={handlePayment}>
              {/* HIDDEN EMAIL (auto-filled) */}
              <input type="hidden" name="email" value={formData.email} />

              {/* COMMON FIELDS */}
              {(isSocialMedia || isGmbSocial) && (
                <>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Link</label>
                    <input
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Additional Requirements</label>
                    <textarea
                      name="requirements"
                      rows="4"
                      value={formData.requirements}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* WEBSITE */}
              {isWebsite && (
                <>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Requirements</label>
                    <textarea
                      name="requirements"
                      rows="4"
                      value={formData.requirements}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* GMB FULL SETUP */}
              {isGmbFullSetup && (
                <>
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Business Category</label>
                    <input
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Map Link</label>
                    <input
                      name="mapLocation"
                      value={formData.mapLocation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Working Hours</label>
                    <input
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Website (optional)</label>
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload Photos</label>
                    <input type="file" multiple onChange={onPhotoSelect} />
                  </div>

                  <div className="form-group">
                    <label>Additional Requirements</label>
                    <textarea
                      name="requirements"
                      rows="4"
                      value={formData.requirements}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-proceed-payment"
              >
                {processing
                  ? "Processing..."
                  : `PAY ₹${finalTotal.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
