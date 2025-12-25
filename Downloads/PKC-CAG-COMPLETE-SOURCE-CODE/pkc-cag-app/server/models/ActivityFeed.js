// server/models/ActivityFeed.js
const mongoose = require('mongoose');

const activityFeedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['purchase', 'review', 'referral', 'level_up', 'achievement', 'follower'],
      required: true,
    },
    title: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed, // {orderId, serviceId, reviewId, etc}
    isPublic: {
      type: Boolean,
      default: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityFeed', activityFeedSchema);
