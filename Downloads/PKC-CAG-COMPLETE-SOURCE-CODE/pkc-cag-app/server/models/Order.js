// server/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // FINAL PRICE PAID BY USER
    amount: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    // Razorpay fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },

    // =====================================================
    // CUSTOMER DETAILS (universal structure for all services)
    // =====================================================
    customerDetails: {
      // Common
      name: String,
      phone: String,
      email: String,          // 🔥 important for sending mail

      // Social media + SEO + GMB signals
      link: String,
      requirements: String,

      // Website design
      websiteRequirements: String,

      // GMB Full Setup
      businessName: String,
      businessCategory: String,
      mapLocation: String,
      address: String,
      workingHours: String,
      website: String,
    },

    // Uploaded photos (GMB full setup)
    uploadedPhotos: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
