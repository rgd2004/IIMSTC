// server/models/AdminRole.js
const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['super-admin', 'admin', 'manager', 'support', 'analyst'],
    },

    description: String,

    // Permissions
    permissions: [
      {
        type: String,
        // Examples: 'manage_users', 'manage_orders', 'view_analytics', 'manage_coupons', etc.
      },
    ],

    // Module access
    modules: [
      {
        type: String,
        enum: [
          'dashboard',
          'users',
          'orders',
          'services',
          'analytics',
          'coupons',
          'reviews',
          'referrals',
          'withdrawals',
          'support-tickets',
          'reports',
          'settings',
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminRole', adminRoleSchema);
