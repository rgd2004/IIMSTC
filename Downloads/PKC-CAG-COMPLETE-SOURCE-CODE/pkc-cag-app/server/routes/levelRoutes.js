// server/routes/levelRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUserLevel,
  addExperiencePoints,
  getLevelBenefits,
  getAchievements,
  getAllLevelsInfo,
} = require('../controllers/levelController');

const router = express.Router();

// Public routes
router.get('/all-levels', getAllLevelsInfo);

// Protected routes (User must be logged in)
router.get('/my-level', protect, getUserLevel);
router.get('/benefits', protect, getLevelBenefits);
router.get('/achievements', protect, getAchievements);

// Admin route to add XP (called internally)
router.post('/add-xp', protect, addExperiencePoints);

module.exports = router;
