const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
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
    type: {
      type: String,
      enum: ['fund_release', 'refund'],
      required: true,
      // fund_release: Client releases funds for freelancer payment
      // refund: Client requests refund for incomplete work
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    reason: {
      type: String,
      // For refund requests: why client is requesting refund
      // For fund releases: optional notes
    },
    adminNotes: {
      type: String,
      // Admin's notes when approving/rejecting
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      // When admin approved the request
    },
    completedAt: {
      type: Date,
      // When payment was actually processed
    },
    // For fund release tracking
    freelancerAmount: {
      type: Number,
      // 90% of total amount
    },
    adminCommission: {
      type: Number,
      // 10% of total amount
    },
  },
  { timestamps: true }
);

// Index for common queries
paymentRequestSchema.index({ contractId: 1, status: 1 });
paymentRequestSchema.index({ clientId: 1, status: 1 });
paymentRequestSchema.index({ freelancerId: 1, status: 1 });
paymentRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
