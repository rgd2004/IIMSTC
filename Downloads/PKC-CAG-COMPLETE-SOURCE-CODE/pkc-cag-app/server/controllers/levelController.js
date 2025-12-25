// server/controllers/levelController.js
const UserLevel = require('../models/UserLevel');
const User = require('../models/User');

// =============================
// LEVEL CONFIGURATION
// =============================
const LEVEL_CONFIG = {
  1: { minXP: 0, discount: 0.01, multiplier: 1 },
  2: { minXP: 100, discount: 0.02, multiplier: 1.1 },
  3: { minXP: 300, discount: 0.03, multiplier: 1.2 },
  4: { minXP: 600, discount: 0.04, multiplier: 1.3 },
  5: { minXP: 1000, discount: 0.05, multiplier: 1.4 },
  6: { minXP: 1500, discount: 0.06, multiplier: 1.5 },
  7: { minXP: 2100, discount: 0.07, multiplier: 1.6 },
  8: { minXP: 2800, discount: 0.08, multiplier: 1.7 },
  9: { minXP: 3600, discount: 0.09, multiplier: 1.8 },
  10: { minXP: 4500, discount: 0.1, multiplier: 2 },
};

const ACHIEVEMENTS = [
  { name: 'First Purchase', xp: 50, icon: '🛍️' },
  { name: 'First Review', xp: 25, icon: '⭐' },
  { name: 'First Referral', xp: 100, icon: '👥' },
  { name: 'Referral Master', xp: 250, condition: (stats) => stats.totalReferrals >= 10, icon: '👑' },
  { name: 'Reviewer Pro', xp: 200, condition: (stats) => stats.totalReviews >= 20, icon: '📝' },
  { name: 'Big Spender', xp: 300, condition: (stats) => stats.totalSpent >= 10000, icon: '💰' },
  { name: 'Level 5 Reached', xp: 150, condition: (stats) => stats.currentLevel >= 5, icon: '🎯' },
  { name: 'Influencer', xp: 400, condition: (stats) => stats.followers >= 50, icon: '📢' },
];

// =============================
// GET OR CREATE USER LEVEL
// =============================
exports.getUserLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    let userLevel = await UserLevel.findOne({ userId });

    if (!userLevel) {
      userLevel = new UserLevel({
        userId,
        currentLevel: 1,
        experiencePoints: 0,
        totalExperiencePoints: 0,
        achievements: [],
      });
      await userLevel.save();
    }

    res.json({
      success: true,
      data: userLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user level',
    });
  }
};

// =============================
// ADD EXPERIENCE POINTS
// =============================
exports.addExperiencePoints = async (req, res) => {
  try {
    const { userId, points, source } = req.body;

    let userLevel = await UserLevel.findOne({ userId });
    if (!userLevel) {
      userLevel = new UserLevel({ userId });
    }

    userLevel.experiencePoints += points;
    userLevel.totalExperiencePoints += points;

    // Check for level up
    await checkLevelUp(userLevel);

    await userLevel.save();

    res.json({
      success: true,
      message: `Awarded ${points} XP for ${source}`,
      data: userLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add experience points',
    });
  }
};

// =============================
// CHECK AND APPLY LEVEL UP
// =============================
async function checkLevelUp(userLevel) {
  const currentLevelConfig = LEVEL_CONFIG[userLevel.currentLevel];
  const nextLevelConfig = LEVEL_CONFIG[userLevel.currentLevel + 1];

  if (nextLevelConfig && userLevel.totalExperiencePoints >= nextLevelConfig.minXP) {
    userLevel.currentLevel += 1;
    userLevel.experiencePoints = 0;

    // Add achievement for level up
    const achievement = {
      name: `Reached Level ${userLevel.currentLevel}`,
      icon: '🎉',
      unlockedAt: new Date(),
    };
    userLevel.achievements.push(achievement);

    // Recursively check for next level
    await checkLevelUp(userLevel);
  }
}

// =============================
// GET LEVEL BENEFITS
// =============================
exports.getLevelBenefits = async (req, res) => {
  try {
    const userId = req.user.id;
    let userLevel = await UserLevel.findOne({ userId });

    if (!userLevel) {
      userLevel = new UserLevel({ userId });
      await userLevel.save();
    }

    const levelConfig = LEVEL_CONFIG[userLevel.currentLevel];
    const nextLevelConfig = LEVEL_CONFIG[userLevel.currentLevel + 1];

    const benefits = {
      currentLevel: userLevel.currentLevel,
      currentBenefits: {
        discountPercentage: (levelConfig.discount * 100).toFixed(1),
        pointsMultiplier: levelConfig.multiplier,
        prioritySupport: userLevel.currentLevel >= 5,
        exclusiveServices: userLevel.currentLevel >= 7,
        earlyAccess: userLevel.currentLevel >= 8,
      },
      nextLevelBenefits: nextLevelConfig ? {
        level: userLevel.currentLevel + 1,
        discountPercentage: (nextLevelConfig.discount * 100).toFixed(1),
        pointsMultiplier: nextLevelConfig.multiplier,
      } : null,
      progressToNextLevel:
        nextLevelConfig
          ? {
              totalXPNeeded: nextLevelConfig.minXP,
              currentXP: userLevel.totalExperiencePoints,
              percentProgress: ((userLevel.totalExperiencePoints / nextLevelConfig.minXP) * 100).toFixed(1),
            }
          : null,
    };

    res.json({
      success: true,
      data: benefits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch level benefits',
    });
  }
};

// =============================
// GET USER ACHIEVEMENTS
// =============================
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    let userLevel = await UserLevel.findOne({ userId });

    if (!userLevel) {
      userLevel = new UserLevel({ userId });
      await userLevel.save();
    }

    res.json({
      success: true,
      data: {
        unlockedAchievements: userLevel.achievements,
        totalAchievements: ACHIEVEMENTS.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
    });
  }
};

// =============================
// GET ALL LEVELS INFO
// =============================
exports.getAllLevelsInfo = async (req, res) => {
  try {
    const levelsInfo = Object.entries(LEVEL_CONFIG).map(([level, config]) => ({
      level: parseInt(level),
      minXP: config.minXP,
      discount: `${(config.discount * 100).toFixed(1)}%`,
      multiplier: `${(config.multiplier * 100).toFixed(0)}%`,
    }));

    res.json({
      success: true,
      data: levelsInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch levels info',
    });
  }
};

// =============================
// AWARD XP FOR PURCHASE (Called by Order Controller)
// =============================
exports.awardPurchaseXP = async (userId, amount) => {
  try {
    const xpPoints = Math.floor(amount / 100) * 10; // 10 XP per ₹100

    let userLevel = await UserLevel.findOne({ userId });
    if (!userLevel) {
      userLevel = new UserLevel({ userId });
    }

    userLevel.experiencePoints += xpPoints;
    userLevel.totalExperiencePoints += xpPoints;

    await checkLevelUp(userLevel);
    await userLevel.save();

    return userLevel;
  } catch (error) {
    console.error('Error awarding purchase XP:', error);
  }
};

// =============================
// AWARD XP FOR REVIEW (Called by Review Controller)
// =============================
exports.awardReviewXP = async (userId) => {
  try {
    const xpPoints = 5;

    let userLevel = await UserLevel.findOne({ userId });
    if (!userLevel) {
      userLevel = new UserLevel({ userId });
    }

    userLevel.experiencePoints += xpPoints;
    userLevel.totalExperiencePoints += xpPoints;

    await checkLevelUp(userLevel);
    await userLevel.save();

    return userLevel;
  } catch (error) {
    console.error('Error awarding review XP:', error);
  }
};

// =============================
// AWARD XP FOR REFERRAL (Called by Referral Controller)
// =============================
exports.awardReferralXP = async (userId) => {
  try {
    const xpPoints = 15;

    let userLevel = await UserLevel.findOne({ userId });
    if (!userLevel) {
      userLevel = new UserLevel({ userId });
    }

    userLevel.experiencePoints += xpPoints;
    userLevel.totalExperiencePoints += xpPoints;

    await checkLevelUp(userLevel);
    await userLevel.save();

    return userLevel;
  } catch (error) {
    console.error('Error awarding referral XP:', error);
  }
};
