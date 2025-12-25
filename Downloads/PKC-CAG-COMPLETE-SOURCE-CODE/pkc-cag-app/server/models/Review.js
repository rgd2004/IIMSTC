// server/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Reference to order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One review per order
    },

    // User who left review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Service being reviewed
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    // Review content
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Images
    images: [
      {
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Verified purchase badge
    isVerifiedPurchase: {
      type: Boolean,
      default: true, // Only users with paid orders can review
    },

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    rejectionReason: String,

    // Admin response
    adminResponse: {
      respondedBy: mongoose.Schema.Types.ObjectId,
      response: String,
      respondedAt: Date,
    },

    // Helpfulness
    helpfulCount: {
      type: Number,
      default: 0,
    },

    unhelpfulCount: {
      type: Number,
      default: 0,
    },

    // User votes for helpfulness
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    unhelpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Spam/report
    isReported: {
      type: Boolean,
      default: false,
    },

    reportReasons: [String],
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ serviceId: 1, status: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
