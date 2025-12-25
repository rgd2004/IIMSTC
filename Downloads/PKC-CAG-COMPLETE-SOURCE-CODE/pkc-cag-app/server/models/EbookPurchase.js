const mongoose = require('mongoose');

const ebookPurchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ebook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EBook',
      required: true,
    },

    // Payment info
    amount: {
      type: Number,
      required: true,
    },

    transactionId: {
      type: String, // Razorpay payment ID
      required: false,  // Will be set after payment verification
      default: null,
    },

    orderId: {
      type: String, // Razorpay order ID
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },

    // Download tracking
    downloadUrl: String,

    downloadsCount: {
      type: Number,
      default: 0,
    },

    lastDownloadedAt: Date,

    // Email delivery
    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: Date,

    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EbookPurchase', ebookPurchaseSchema);
