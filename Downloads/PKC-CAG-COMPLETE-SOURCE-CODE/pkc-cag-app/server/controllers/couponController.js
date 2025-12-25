// server/controllers/couponController.js
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');

// Admin: Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      expiryDate,
      maxUsages,
      maxUsagePerUser,
      applicableServices,
      applicableCategories,
      applicableToNewUsersOnly,
      campaignName,
    } = req.body;

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 0 and 100' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      expiryDate,
      maxUsages,
      maxUsagePerUser,
      applicableServices,
      applicableCategories,
      applicableToNewUsersOnly,
      campaignName,
      createdBy: req.user._id,
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;

    let query = {};
    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.expiryDate = { $lte: new Date() };
    }

    const coupons = await Coupon.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('applicableServices', 'name')
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent code changes
    delete updates.code;

    const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Validate and apply coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, serviceId } = req.body;
    const userId = req.user._id;

    // Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).populate('applicableServices');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found or inactive',
      });
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired',
      });
    }

    // Check max usages
    if (coupon.maxUsages && coupon.currentUsages >= coupon.maxUsages) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded',
      });
    }

    // Check user usage limit
    const userUsageCount = coupon.usageHistory.filter(
      (usage) => usage.userId.toString() === userId.toString()
    ).length;

    if (userUsageCount >= coupon.maxUsagePerUser) {
      return res.status(400).json({
        success: false,
        message: `You can only use this coupon ${coupon.maxUsagePerUser} time(s)`,
      });
    }

    // Check if user is excluded
    if (coupon.excludedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not applicable to your account',
      });
    }

    // Check new user restriction
    if (coupon.applicableToNewUsersOnly) {
      const user = await User.findById(userId);
      const userOrderCount = await Order.countDocuments({ userId });
      if (userOrderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only for new users',
        });
      }
    }

    // Check min purchase amount
    if (orderAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is ₹${coupon.minPurchaseAmount}`,
      });
    }

    // Check applicable services/categories
    if (coupon.applicableServices.length > 0) {
      const isApplicable = coupon.applicableServices.some(
        (service) => service._id.toString() === serviceId
      );
      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to this service',
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        originalAmount: orderAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Internal: Apply coupon to order (called after payment success)
exports.applyCouponToOrder = async (req, res) => {
  try {
    const { orderId, couponId } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Add usage to history
    coupon.usageHistory.push({
      userId: req.user._id,
      orderId,
      usedAt: new Date(),
    });

    coupon.currentUsages += 1;
    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get coupon analytics
exports.getCouponAnalytics = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const totalDiscountGiven = coupon.usageHistory.reduce(
      (sum, usage) => sum + (usage.discountAmount || 0),
      0
    );

    const topUsedBy = await Promise.all(
      [...new Set(coupon.usageHistory.map((u) => u.userId.toString()))].map(
        (userId) => User.findById(userId).select('name email')
      )
    );

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          usageCount: coupon.currentUsages,
          maxUsages: coupon.maxUsages,
          totalDiscountGiven: totalDiscountGiven.toFixed(2),
          conversionRate: (
            (coupon.currentUsages / (coupon.maxUsages || coupon.currentUsages)) *
            100
          ).toFixed(2),
        },
        usageHistory: coupon.usageHistory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
