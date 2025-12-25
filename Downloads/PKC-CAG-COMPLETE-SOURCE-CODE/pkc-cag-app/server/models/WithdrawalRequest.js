const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    paymentDetails: {
      upiId: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String,
    },

    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", withdrawalSchema);
