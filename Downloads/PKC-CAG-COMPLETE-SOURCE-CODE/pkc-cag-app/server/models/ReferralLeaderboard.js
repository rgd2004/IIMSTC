// server/models/ReferralLeaderboard.js
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      enum: ['monthly', 'alltime'],
      default: 'monthly',
    },

    month: Date, // Only for monthly leaderboards

    entries: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        referralCount: Number,
        totalCommission: Number,
        rank: Number,
      },
    ],

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferralLeaderboard', leaderboardSchema);
