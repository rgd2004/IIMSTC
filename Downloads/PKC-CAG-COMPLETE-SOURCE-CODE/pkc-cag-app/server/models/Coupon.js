// server/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    // Discount type and value
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    // Max discount amount (for percentage discounts)
    maxDiscount: {
      type: Number,
      default: null,
    },

    // Min purchase amount required
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },

    // Expiration
    expiryDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Usage limits
    maxUsages: {
      type: Number,
      default: null, // null = unlimited
    },

    maxUsagePerUser: {
      type: Number,
      default: 1, // Max times one user can use this coupon
    },

    currentUsages: {
      type: Number,
      default: 0,
    },

    // Applicable services (empty = all services)
    applicableServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],

    // Applicable service categories
    applicableCategories: [
      {
        type: String,
        enum: ['instagram', 'facebook', 'youtube', 'twitter', 'telegram', 'reviews', 'gmb', 'website', 'seo'],
      },
    ],

    // User restrictions
    applicableToNewUsersOnly: {
      type: Boolean,
      default: false,
    },

    excludedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Analytics
    usageHistory: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        orderId: mongoose.Schema.Types.ObjectId,
        usedAt: { type: Date, default: Date.now },
        discountAmount: Number,
      },
    ],

    // Campaign info
    campaignName: {
      type: String,
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for performance
// Note: code has unique: true which creates an index automatically, don't duplicate
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
