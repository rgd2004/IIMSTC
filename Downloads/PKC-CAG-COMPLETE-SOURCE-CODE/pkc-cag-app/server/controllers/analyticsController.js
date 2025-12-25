// server/controllers/analyticsController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Service = require('../models/Service');
const Analytics = require('../models/Analytics');

// Get dashboard analytics (overview)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Total revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total orders
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });

    // Total users
    const totalUsers = await User.countDocuments();

    // Total referral earnings
    const referralEarnings = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$referralEarnings' } } },
    ]);
    const totalReferralEarnings = referralEarnings[0]?.total || 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid',
    });

    // New users (last 30 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalUsers,
        totalReferralEarnings: totalReferralEarnings.toFixed(2),
        averageOrderValue: parseFloat(avgOrderValue),
        recentOrders30Days: recentOrders,
        newUsers30Days: newUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get revenue trends (daily/weekly/monthly)
exports.getRevenueTrends = async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let groupStage;
    if (period === 'daily') {
      groupStage = {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      };
    } else if (period === 'weekly') {
      groupStage = {
        $group: {
          _id: {
            $week: '$createdAt',
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      };
    } else {
      groupStage = {
        $group: {
          _id: {
            $month: '$createdAt',
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      };
    }

    const trends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid',
        },
      },
      groupStage,
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top services
exports.getTopServices = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topServices = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: {
          _id: '$service',
          ordersCount: { $sum: 1 },
          revenue: { $sum: '$amount' },
          avgOrderValue: { $avg: '$amount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      { $unwind: '$serviceDetails' },
      {
        $project: {
          serviceId: '$_id',
          serviceName: '$serviceDetails.name',
          ordersCount: 1,
          revenue: 1,
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
        },
      },
    ]);

    res.json({ success: true, data: topServices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment analytics
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          revenue: { $round: ['$revenue', 2] },
        },
      },
    ]);

    res.json({ success: true, data: paymentStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // New users trend
    const newUsersTrend = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total users by type
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const googleAuthUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });

    res.json({
      success: true,
      data: {
        newUsersTrend,
        stats: {
          totalUsers,
          adminUsers,
          verifiedUsers,
          googleAuthUsers,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get referral analytics
exports.getReferralAnalytics = async (req, res) => {
  try {
    // Total referral earnings
    const referralStats = await User.aggregate([
      {
        $match: {
          referralEarnings: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$referralEarnings' },
          totalReferrers: { $sum: 1 },
          avgEarnings: { $avg: '$referralEarnings' },
          maxEarnings: { $max: '$referralEarnings' },
        },
      },
    ]);

    // Top referrers
    const topReferrers = await User.find({ referralEarnings: { $gt: 0 } })
      .sort({ referralEarnings: -1 })
      .limit(10)
      .select('name email referralEarnings referralCode');

    res.json({
      success: true,
      data: {
        stats: referralStats[0] || {
          totalEarnings: 0,
          totalReferrers: 0,
          avgEarnings: 0,
          maxEarnings: 0,
        },
        topReferrers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order status distribution
exports.getOrderStatusAnalytics = async (req, res) => {
  try {
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          revenue: { $round: ['$revenue', 2] },
        },
      },
    ]);

    res.json({ success: true, data: statusDistribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export analytics (CSV/PDF-ready data)
exports.exportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: 'paid',
    })
      .populate('userId', 'name email')
      .populate('service', 'name')
      .select('_id createdAt amount status service userId')
      .lean();

    res.json({
      success: true,
      data: orders,
      format,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
