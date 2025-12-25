// server/routes/userProfileRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  downloadAccountData,
  deleteAccount,
  getUserReviews,
  getUserOrders,
} = require('../controllers/userProfileController');

// All routes require authentication
router.use(protect);

// Get profile
router.get('/me', getUserProfile);

// Update profile
router.put('/update', updateUserProfile);

// Get user reviews
router.get('/reviews', getUserReviews);

// Get user orders
router.get('/orders', getUserOrders);

// Download account data (GDPR)
router.get('/download-data', downloadAccountData);

// Delete account
router.post('/delete-account', deleteAccount);

module.exports = router;
