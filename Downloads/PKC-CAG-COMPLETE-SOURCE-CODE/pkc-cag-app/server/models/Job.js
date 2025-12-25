// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // Client who posted the job
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Job details
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      enum: ['design', 'development', 'writing', 'marketing', 'video', 'data', 'consulting', 'other'],
      required: true,
    },

    skills: [String], // Required skills

    // Budget details
    budget: {
      type: Number, // Fixed price
      required: true,
    },

    // Duration
    duration: {
      type: String,
      enum: ['one-time', 'short-term', 'long-term'],
      default: 'one-time',
    },

    deliveryTime: {
      type: Number, // Days to complete
      required: true,
    },

    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // Status
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },

    // Freelancer selection
    selectedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Applications
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],

    // Attachments
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Metadata
    deadline: Date,
    views: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },

    // Completion details
    completedAt: Date,
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
  },
  { timestamps: true }
);

// Indexes
jobSchema.index({ clientId: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ budget: 1 });

module.exports = mongoose.model('Job', jobSchema);
