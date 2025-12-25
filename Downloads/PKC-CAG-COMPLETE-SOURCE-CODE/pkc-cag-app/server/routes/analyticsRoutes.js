// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getRevenueTrends,
  getTopServices,
  getPaymentAnalytics,
  getUserAnalytics,
  getReferralAnalytics,
  getOrderStatusAnalytics,
  exportAnalytics,
} = require('../controllers/analyticsController');

// All analytics routes require admin access
router.use(protect, admin);

// Dashboard overview
router.get('/dashboard', getDashboardAnalytics);

// Revenue trends
router.get('/revenue-trends', getRevenueTrends);

// Top services
router.get('/top-services', getTopServices);

// Payment analytics
router.get('/payment', getPaymentAnalytics);

// User analytics
router.get('/users', getUserAnalytics);

// Referral analytics
router.get('/referrals', getReferralAnalytics);

// Order status analytics
router.get('/order-status', getOrderStatusAnalytics);

// Export analytics
router.get('/export', exportAnalytics);

module.exports = router;
