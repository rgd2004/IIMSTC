// server/models/ExportHistory.js
const mongoose = require('mongoose');

const exportHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exportType: {
      type: String,
      enum: ['json', 'csv', 'pdf'],
      required: true,
    },
    fileName: String,
    fileSize: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    dataIncluded: [String], // ['orders', 'reviews', 'profile', 'referrals']
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduleFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
    },
    nextScheduledDate: Date,
    downloadUrl: String,
    expiresAt: Date, // Link expires after 7 days
    error: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExportHistory', exportHistorySchema);
