// server/controllers/userProfileController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');

// =============================
// GET USER PROFILE
// =============================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user stats
    const totalOrders = await Order.countDocuments({ userId: req.user.id });
    const totalReviews = await Review.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        totalOrders,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// =============================
// UPDATE USER PROFILE
// =============================
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// =============================
// DOWNLOAD ACCOUNT DATA (GDPR)
// =============================
exports.downloadAccountData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get all related data
    const orders = await Order.find({ userId: req.user.id }).populate('service', 'name category');
    const reviews = await Review.find({ userId: req.user.id }).populate('serviceId', 'name');

    const accountData = {
      exportDate: new Date().toISOString(),
      userInfo: user,
      orders: orders,
      reviews: reviews,
      statistics: {
        totalOrders: orders.length,
        totalReviews: reviews.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
        referralEarnings: user.referralEarnings,
        joinDate: user.createdAt,
      },
    };

    // Send as JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="account-data-${new Date().toISOString().split('T')[0]}.json"`
    );
    res.json(accountData);
  } catch (error) {
    console.error('Error downloading account data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download account data',
    });
  }
};

// =============================
// DELETE ACCOUNT
// =============================
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    // Delete user data (soft delete - mark as deleted instead of hard delete)
    await User.findByIdAndUpdate(req.user.id, {
      isActive: false,
      deletedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Account deleted successfully. All your data has been securely deleted.',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};

// =============================
// GET USER REVIEWS
// =============================
exports.getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: req.user.id })
      .populate('serviceId', 'name')
      .populate('orderId', 'status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
    });
  }
};

// =============================
// GET USER ORDERS
// =============================
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.id })
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};
