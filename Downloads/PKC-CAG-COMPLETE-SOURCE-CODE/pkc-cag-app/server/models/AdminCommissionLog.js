// server/models/AdminCommissionLog.js
/**
 * Tracks every commission earned by the admin
 * Each job contract creates one commission log entry
 */

const mongoose = require('mongoose');

const adminCommissionLogSchema = new mongoose.Schema(
  {
    // Admin who earned this commission
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Source of commission
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },

    // Commission details
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    jobAmount: {
      type: Number,
      required: true,
    },

    commissionRate: {
      type: Number,
      default: 10, // 10%
    },

    // Client & Freelancer info
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    clientName: String,

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    freelancerName: String,

    // Job details
    jobTitle: String,
    jobDescription: String,

    // Status
    status: {
      type: String,
      enum: ['earned', 'pending', 'withdrawn', 'refunded'],
      default: 'earned',
    },

    // Withdrawal tracking
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WithdrawalRequest',
      default: null,
    },

    withdrawnAt: {
      type: Date,
      default: null,
    },

    // Contract payment status
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'refunded'],
      default: 'pending',
    },

    paidAt: Date,

    // Metadata
    notes: String,
  },
  { timestamps: true }
);

// Index for quick queries
adminCommissionLogSchema.index({ adminId: 1, createdAt: -1 });
adminCommissionLogSchema.index({ contractId: 1 });
adminCommissionLogSchema.index({ status: 1, adminId: 1 });
adminCommissionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminCommissionLog', adminCommissionLogSchema);
