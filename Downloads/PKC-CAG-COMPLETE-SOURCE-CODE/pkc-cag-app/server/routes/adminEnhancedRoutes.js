// server/routes/adminEnhancedRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createRole,
  getAllRoles,
  updateRole,
  assignRoleToUser,
  getAdminUsers,
  bulkUpdateOrders,
  bulkExportUsers,
  bulkApproveReviews,
  getActivityLogs,
  getActivitySummary,
  getAdminDashboardSummary,
  generateCustomReport,
} = require('../controllers/adminEnhancedController');

// All routes require admin authentication
router.use(protect, admin);

// =======================
// ROLE MANAGEMENT
// =======================
router.post('/roles/create', createRole);
router.get('/roles', getAllRoles);
router.put('/roles/:id', updateRole);

// =======================
// ADMIN USER MANAGEMENT
// =======================
router.post('/users/assign-role', assignRoleToUser);
router.get('/users', getAdminUsers);

// =======================
// BULK OPERATIONS
// =======================
router.post('/bulk/update-orders', bulkUpdateOrders);
router.post('/bulk/export-users', bulkExportUsers);
router.post('/bulk/approve-reviews', bulkApproveReviews);

// =======================
// ACTIVITY LOGS
// =======================
router.get('/logs/activity', getActivityLogs);
router.get('/logs/summary', getActivitySummary);

// =======================
// DASHBOARD & REPORTS
// =======================
router.get('/dashboard/summary', getAdminDashboardSummary);
router.post('/reports/custom', generateCustomReport);

module.exports = router;
