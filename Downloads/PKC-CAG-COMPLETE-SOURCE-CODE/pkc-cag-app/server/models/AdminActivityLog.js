// server/models/AdminActivityLog.js
const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    adminName: String,

    action: {
      type: String,
      required: true,
      // Examples: 'user_created', 'order_updated', 'coupon_deleted', etc.
    },

    resourceType: {
      type: String,
      enum: [
        'user',
        'order',
        'service',
        'coupon',
        'review',
        'withdrawal',
        'settings',
        'report',
      ],
    },

    resourceId: String,

    resourceName: String,

    // Changes made
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },

    ipAddress: String,

    userAgent: String,

    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },

    description: String,
  },
  { timestamps: true }
);

adminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
adminActivityLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
