// server/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToOrder,
  getCouponAnalytics,
} = require('../controllers/couponController');

// Admin routes
router.post('/create', protect, admin, createCoupon);
router.get('/all', protect, admin, getAllCoupons);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);
router.get('/analytics/:couponId', protect, admin, getCouponAnalytics);

// User routes
router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCouponToOrder);

module.exports = router;
