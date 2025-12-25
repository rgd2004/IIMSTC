// server/models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    
    // Revenue metrics
    totalRevenue: {
      type: Number,
      default: 0,
    },
    
    ordersCount: {
      type: Number,
      default: 0,
    },
    
    // User metrics
    newUsersCount: {
      type: Number,
      default: 0,
    },
    
    activeUsersCount: {
      type: Number,
      default: 0,
    },
    
    // Service metrics
    topService: {
      serviceId: String,
      serviceName: String,
      ordersCount: Number,
      revenue: Number,
    },
    
    // Payment metrics
    successfulPayments: {
      type: Number,
      default: 0,
    },
    
    failedPayments: {
      type: Number,
      default: 0,
    },
    
    // Referral metrics
    referralOrdersCount: {
      type: Number,
      default: 0,
    },
    
    referralRevenue: {
      type: Number,
      default: 0,
    },
    
    // Conversion metrics
    conversionRate: {
      type: Number,
      default: 0,
    },
    
    averageOrderValue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
