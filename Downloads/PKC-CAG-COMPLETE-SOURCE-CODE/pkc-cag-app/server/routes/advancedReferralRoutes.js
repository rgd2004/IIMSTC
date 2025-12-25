// server/routes/advancedReferralRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReferralAnalytics,
  getReferralTree,
  getLeaderboard,
  getUserRank,
  getAchievements,
  getMarketingMaterials,
  getCommissionHistory,
} = require('../controllers/advancedReferralController');

// User routes
router.get('/analytics', protect, getReferralAnalytics);
router.get('/tree', protect, getReferralTree);
router.get('/rank', protect, getUserRank);
router.get('/achievements', protect, getAchievements);
router.get('/marketing-materials', protect, getMarketingMaterials);
router.get('/commission-history', protect, getCommissionHistory);

// Public routes
router.get('/leaderboard', getLeaderboard);

module.exports = router;
