// server/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createReview,
  getUserReviews,
  getServiceReviews,
  markHelpful,
  markUnhelpful,
  getPendingReviews,
  approveReview,
  rejectReview,
  respondToReview,
  getReviewStats,
} = require('../controllers/reviewController');

// User routes
router.post('/create', protect, createReview);
router.get('/my-reviews', protect, getUserReviews);
router.post('/:reviewId/helpful', protect, markHelpful);
router.post('/:reviewId/unhelpful', protect, markUnhelpful);

// Public routes
router.get('/service/:serviceId', getServiceReviews);
router.get('/stats/:serviceId', getReviewStats);

// Admin routes
router.get('/admin/pending', protect, admin, getPendingReviews);
router.put('/admin/:reviewId/approve', protect, admin, approveReview);
router.put('/admin/:reviewId/reject', protect, admin, rejectReview);
router.put('/admin/:reviewId/respond', protect, admin, respondToReview);

module.exports = router;
