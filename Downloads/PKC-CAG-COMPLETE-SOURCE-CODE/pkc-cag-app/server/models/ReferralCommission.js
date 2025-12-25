// server/models/ReferralCommission.js
const mongoose = require('mongoose');

const referralCommissionSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Commission tier
    tier: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },

    // Tier 1: Direct referral (10%)
    // Tier 2: Referral's referrals (3%)
    // Tier 3: Deeper levels (1%)
    commissionRate: {
      type: Number,
      required: true,
    },

    // Order that generated commission
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },

    orderAmount: Number,

    // Commission amount
    commissionAmount: {
      type: Number,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'earned', 'withdrawn'],
      default: 'pending',
    },

    // When commission was earned
    earnedAt: {
      type: Date,
      default: Date.now,
    },

    // When commission was withdrawn
    withdrawnAt: Date,
  },
  { timestamps: true }
);

referralCommissionSchema.index({ referrerId: 1, status: 1 });
referralCommissionSchema.index({ earnedAt: -1 });

module.exports = mongoose.model('ReferralCommission', referralCommissionSchema);
