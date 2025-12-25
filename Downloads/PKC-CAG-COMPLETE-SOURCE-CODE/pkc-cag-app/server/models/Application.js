// server/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // Job and freelancer
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Application details
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    proposedBudget: {
      type: Number,
      required: true,
    },

    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Freelancer portfolio for this job
    portfolio: [
      {
        title: String,
        description: String,
        url: String,
      },
    ],

    // Freelancer payment details (admin-only visibility)
    upiId: {
      type: String,
      required: true,
    },

    paymentDetails: {
      type: String,
      required: true,
    },

    workReceivingEmail: {
      type: String,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },

    // Rating after job completion
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      ratedAt: Date,
    },

    rejectionReason: String,

    // Metadata
    applicationsCount: Number, // Total applications for the job when applied
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
applicationSchema.index({ freelancerId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
