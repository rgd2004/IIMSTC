const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: 'Admin',
    },

    category: {
      type: String,
      enum: ['Technology', 'Business', 'Self-Help', 'Fiction', 'Education', 'Other'],
      default: 'Other',
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      min: 0,
    },

    // Files
    coverImage: {
      type: String, // URL
      required: true,
    },

    pdfFile: {
      type: String, // URL or file path
      required: true,
    },

    fileSize: {
      type: Number, // in bytes
    },

    // Content info
    pages: {
      type: Number,
    },

    language: {
      type: String,
      default: 'English',
    },

    // Status
    published: {
      type: Boolean,
      default: false,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    // Analytics
    totalSales: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EBook', ebookSchema);
