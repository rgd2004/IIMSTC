// server/controllers/adminEnhancedController.js
const User = require('../models/User');
const AdminRole = require('../models/AdminRole');
const AdminActivityLog = require('../models/AdminActivityLog');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// Helper: Log admin activity
const logAdminActivity = async (adminId, adminName, action, resourceType, resourceId, changes, req, status = 'success') => {
  try {
    await AdminActivityLog.create({
      adminId,
      adminName,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status,
      description: `${action} on ${resourceType} ${resourceId}`,
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// =======================
// ROLE MANAGEMENT
// =======================

// Create role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, modules } = req.body;

    const role = new AdminRole({
      name,
      description,
      permissions,
      modules,
    });

    await role.save();

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'create_role',
      'role',
      role._id,
      { after: role },
      req
    );

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find().sort({ name: 1 });
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const oldRole = await AdminRole.findById(id);
    const role = await AdminRole.findByIdAndUpdate(id, updates, { new: true });

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'update_role',
      'role',
      id,
      { before: oldRole, after: role },
      req
    );

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// USER ROLE ASSIGNMENT
// =======================

// Assign role to user
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate role exists
    const roleExists = await AdminRole.findOne({ name: role });
    if (!roleExists) {
      return res.status(400).json({ message: 'Role does not exist' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { adminRole: role },
      { new: true }
    );

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'assign_role',
      'user',
      userId,
      { after: { adminRole: role } },
      req
    );

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get admin users
exports.getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const admins = await User.find({ isAdmin: true })
      .select('name email isAdmin adminRole isActive createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isAdmin: true });

    res.json({
      success: true,
      data: admins,
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

// =======================
// BULK OPERATIONS
// =======================

// Bulk update orders
exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status }
    );

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'bulk_update_orders',
      'order',
      `${orderIds.length} orders`,
      { after: { orderIds, status } },
      req
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders updated`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk export users
exports.bulkExportUsers = async (req, res) => {
  try {
    const { filters } = req.body;

    let query = {};
    if (filters.isVerified) query.isVerified = true;
    if (filters.isAdmin) query.isAdmin = true;
    if (filters.isActive) query.isActive = true;

    const users = await User.find(query)
      .select('name email phone businessName isVerified createdAt')
      .lean();

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'bulk_export_users',
      'user',
      `${users.length} users`,
      { after: { count: users.length, filters } },
      req
    );

    res.json({
      success: true,
      data: users,
      format: 'csv',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk approve reviews
exports.bulkApproveReviews = async (req, res) => {
  try {
    const Review = require('../models/Review');
    const { reviewIds } = req.body;

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { status: 'approved' }
    );

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'bulk_approve_reviews',
      'review',
      `${reviewIds.length} reviews`,
      { after: { reviewIds, status: 'approved' } },
      req
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} reviews approved`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// ADMIN ACTIVITY LOGS
// =======================

// Get admin activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { adminId, action, resourceType, page = 1, limit = 20 } = req.query;

    let query = {};
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    const logs = await AdminActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('adminId', 'name email');

    const total = await AdminActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
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

// Get admin activity summary
exports.getActivitySummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const summary = await AdminActivityLog.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: {
            adminId: '$adminId',
            adminName: '$adminName',
          },
          actionCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      { $sort: { actionCount: -1 } },
    ]);

    // Action breakdown
    const actionBreakdown = await AdminActivityLog.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        adminActivity: summary,
        actionBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// ADMIN DASHBOARD ENHANCEMENTS
// =======================

// Get admin dashboard summary
exports.getAdminDashboardSummary = async (req, res) => {
  try {
    // Overview stats
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Recent activities
    const recentActivities = await AdminActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('adminId', 'name');

    // Pending items count
    const Review = require('../models/Review');
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    const WithdrawalRequest = require('../models/WithdrawalRequest');
    const pendingWithdrawals = await WithdrawalRequest.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrders,
          pendingOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingReviews,
          pendingWithdrawals,
        },
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Custom report builder
exports.generateCustomReport = async (req, res) => {
  try {
    const { reportType, filters, columns, startDate, endDate } = req.body;

    let data = [];

    if (reportType === 'orders') {
      data = await Order.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        ...filters,
      })
        .select(columns.join(' '))
        .populate('userId', 'name email')
        .populate('service', 'name')
        .lean();
    } else if (reportType === 'users') {
      data = await User.find({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        ...filters,
      })
        .select(columns.join(' '))
        .lean();
    } else if (reportType === 'revenue') {
      data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            paymentStatus: 'paid',
            ...filters,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    await logAdminActivity(
      req.user._id,
      req.user.name,
      'generate_report',
      'report',
      reportType,
      { after: { reportType, filters } },
      req
    );

    res.json({
      success: true,
      data,
      reportType,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
