// server/models/Dispute.js
const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    // Contract
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // Parties
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Dispute details
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      enum: ['quality-issue', 'not-delivered', 'miscommunication', 'payment-issue', 'other'],
      required: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Evidence
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['open', 'in-review', 'resolved', 'rejected'],
      default: 'open',
    },

    // Resolution
    resolution: {
      type: String,
      enum: ['refund', 'pay', 'partial-refund', 'no-action'],
    },

    adminNotes: String,
    resolutionDetails: {
      amount: Number,
      reason: String,
      decidedAt: Date,
    },

    // Admin
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    resolvedAt: Date,
  },
  { timestamps: true }
);

// Index
disputeSchema.index({ contractId: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ clientId: 1, freelancerId: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
