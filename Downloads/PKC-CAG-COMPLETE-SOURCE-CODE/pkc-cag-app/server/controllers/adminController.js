// server/controllers/adminController.js
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");
const Contract = require("../models/Contract");
const Job = require("../models/Job");
const { logAction } = require('./auditController');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    console.log(
      `Admin Stats Requested → user=${req.user?._id} admin=${req.user?.isAdmin}`
    );

    // ==========================
    // USER & ORDER COUNTS
    // ==========================

    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // ==========================
    // TOTAL REVENUE (only paid)
    //==========================

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // ==========================
    // RECENT ORDERS
    //==========================

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .populate("service", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      },
      recentOrders
    });

  } catch (err) {
    console.error("🔥 Admin Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats"
    });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { isAdmin, isVerified, isActive } = req.body;

    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (typeof isAdmin !== "undefined") user.isAdmin = isAdmin;
    if (typeof isVerified !== "undefined") user.isVerified = isVerified;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    // Audit log
    logAction({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'update_user',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { isAdmin: user.isAdmin, isVerified: user.isVerified, isActive: user.isActive }
    });

    res.json({ success: true, message: "User updated", user });
  } catch (err) {
    console.error("Update user error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user" });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Audit log
    logAction({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'delete_user',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { email: user.email }
    });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete user" });
  }
};

// 📋 GET /api/admin/jobs - Get all freelancing jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('clientId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    console.log(`[Admin getAllJobs] Found ${jobs.length} jobs`);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
};

// 🗑️ DELETE /api/admin/jobs/:jobId
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Audit log
    logAction({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'delete_job',
      resourceType: 'Job',
      resourceId: job._id.toString(),
      details: { title: job.title, clientId: job.clientId }
    });

    console.log(`✅ Job deleted: ${jobId} by admin ${req.user?.email}`);
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};

// 🗑️ DELETE /api/admin/contracts/:contractId
exports.deleteContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findByIdAndDelete(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    // Audit log
    logAction({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'delete_contract',
      resourceType: 'Contract',
      resourceId: contract._id.toString(),
      details: { jobId: contract.jobId, amount: contract.totalAmount }
    });

    console.log(`✅ Contract deleted: ${contractId} by admin ${req.user?.email}`);
    res.json({ success: true, message: "Contract deleted successfully" });
  } catch (err) {
    console.error("Delete contract error:", err);
    res.status(500).json({ success: false, message: "Failed to delete contract" });
  }
};
