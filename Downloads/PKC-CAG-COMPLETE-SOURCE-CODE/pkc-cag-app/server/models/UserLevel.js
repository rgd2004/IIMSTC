// server/models/UserLevel.js
const mongoose = require('mongoose');

const userLevelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    experiencePoints: {
      type: Number,
      default: 0,
    },
    totalExperiencePoints: {
      type: Number,
      default: 0,
    },
    levelProgression: Number, // % progress to next level (0-100)
    achievements: [
      {
        name: String,
        description: String,
        icon: String,
        unlockedAt: Date,
      },
    ],
    levelBenefits: {
      discountPercentage: Number, // Discount based on level
      pointsMultiplier: Number, // 1x, 1.2x, 1.5x etc
      prioritySupport: Boolean,
      exclusiveServices: Boolean,
    },
    lastActivityDate: Date,
    levelUpgradeHistory: [
      {
        fromLevel: Number,
        toLevel: Number,
        upgradedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserLevel', userLevelSchema);
