// server/models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    // Job and parties
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
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

    // Timeline
    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: Date,
    deadline: Date,

    // Financial details
    totalAmount: {
      type: Number,
      required: true,
    },

    commissionRate: {
      type: Number,
      default: 10, // 10%
    },

    platformCommission: {
      type: Number,
      required: true,
    },

    freelancerAmount: {
      type: Number,
      required: true,
    },

    // NEW PAYMENT WORKFLOW SYSTEM
    paymentWorkflow: {
      // Stage 1: Client pays admin
      clientPaymentStatus: {
        type: String,
        enum: ['awaiting_payment', 'paid_to_admin', 'payment_failed'],
        default: 'awaiting_payment',
      },
      clientPaymentDate: Date,
      clientTransactionId: String,
      clientPaymentMethod: String,

      // Stage 2: Work completion & client verification
      workCompletionStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'disputed'],
        default: 'not_started',
      },
      workCompletedAt: Date,

      // Stage 3: Client releases funds to admin
      clientFundsReleasedAt: Date,
      clientReleaseNotes: String,

      // Stage 4: Admin approves fund release to freelancer
      adminApprovalStatus: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'],
        default: 'pending_approval',
      },
      adminApprovedAt: Date,
      adminApprovalNotes: String,

      // Stage 5: Refund handling
      refundRequested: Boolean,
      refundRequestedAt: Date,
      refundReason: String,
      refundStatus: {
        type: String,
        enum: ['no_refund', 'pending_review', 'approved', 'rejected'],
        default: 'no_refund',
      },
      refundApprovedAt: Date,
      refundAmount: Number,

      // Final status
      paymentCompleted: Boolean,
      paymentCompletedAt: Date,
    },

    // Legacy payment fields (kept for backward compatibility)
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: String,
    transactionId: String,
    paidAt: Date,

    // Status
    status: {
      type: String,
      enum: ['active', 'completed', 'disputed', 'cancelled'],
      default: 'active',
    },

    // Completion
    completedAt: Date,
    clientApproved: Boolean,
    clientApprovedAt: Date,

    // Metadata
    milestones: [
      {
        title: String,
        description: String,
        amount: Number,
        dueDate: Date,
        completed: Boolean,
        completedAt: Date,
      },
    ],

    // Freelancer payment receiving details (ADDED for admin to send money)
    freelancerPaymentDetails: {
      bankName: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
      paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'upi', 'not_provided'],
        default: 'not_provided',
      },
      addedAt: Date,
    },

    // Admin payment sending details (ADDED to track money sent)
    adminPaymentSent: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'sent', 'failed'],
        default: 'pending',
      },
      transactionId: String,
      sentAt: Date,
      sentBy: String,
      notes: String,
    },

    // Work submission details from client (after payment)
    workSubmission: {
      description: String,
      deliverables: String,
      timeline: String,
      additionalNotes: String,
      attachmentUrl: String,
      submittedAt: Date,
      submittedBy: String, // clientId
    },

    // Freelancer application details
    freelancerApplication: {
      coverLetter: String,
      proposedBudget: Number,
      deliveryDays: Number,
      portfolio: String,
      paymentMethod: {
        type: String,
        enum: ['upi', 'bank_transfer', 'not_provided'],
        default: 'not_provided',
      },
      upiId: String,
      bankName: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      workReceivingEmail: String,
      appliedAt: Date,
    },
  },
  { timestamps: true }
);

contractSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contract', contractSchema);
