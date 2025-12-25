// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // No password if Google auth
      }
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    phone: String,
    businessName: String,

    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    adminRole: {
      type: String,
      enum: ['super-admin', 'admin', 'manager', 'support', 'analyst'],
      default: null,
    },
    isActive: { type: Boolean, default: true },

    otp: {
      code: String,
      expiresAt: Date,
    },

    avatar: { type: String, default: "" },

    /* ---------------------------------------------------
       🔥 REFERRAL SYSTEM FIELDS
    --------------------------------------------------- */

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: String, // stores referrer's referralCode
      default: null,
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },

    /* ---------------------------------------------------
       � ADMIN COMMISSION TRACKING
    --------------------------------------------------- */
    platformBalance: {
      type: Number,
      default: 0, // Total commission balance (earned - withdrawn)
    },

    totalCommissionEarned: {
      type: Number,
      default: 0, // Lifetime total commission
    },

    totalCommissionWithdrawn: {
      type: Number,
      default: 0, // Total amount already withdrawn
    },

    /* ---------------------------------------------------
       �💸 WITHDRAWAL REQUESTS (Embedded)
    --------------------------------------------------- */
    withdrawalRequests: [
      {
        amount: Number,
        upiId: String,
        status: {
          type: String,
          enum: ["pending", "approved", "declined"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    /* ---------------------------------------------------
       👥 SOCIAL FEATURES (Following/Followers)
    --------------------------------------------------- */
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  { timestamps: true }
);

/* ---------------------------------------------------
   🔐 CONSOLIDATED PRE-SAVE HOOK
   - hashes password when changed
   - ensures referralCode exists (unique-ish)
--------------------------------------------------- */
userSchema.pre("save", async function () {
  try {
    // If password modified -> hash it
    if (this.isModified("password") && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // If referralCode missing -> generate one
    // Use name prefix + last 6 chars of objectId + random suffix to reduce collision chance
    if (!this.referralCode) {
      const prefix = (this.name || "USER").split(" ")[0].toUpperCase().slice(0, 6);
      const idSuffix = (this._id?.toString?.() || Date.now().toString()).slice(-6).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.referralCode = `${prefix}${idSuffix}${rand}`;
    }
  } catch (err) {
    throw err;
  }
});

/* ---------------------------------------------------
   LOGIN PASSWORD CHECK
--------------------------------------------------- */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ---------------------------------------------------
   OTP GENERATION
--------------------------------------------------- */
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };

  return otp;
};

/* ---------------------------------------------------
   OTP VERIFICATION
--------------------------------------------------- */
userSchema.methods.verifyOTP = function (otp) {
  if (!this.otp || !this.otp.code) return false;
  if (Date.now() > this.otp.expiresAt) return false;
  return this.otp.code === otp.toString().trim();
};

module.exports = mongoose.model("User", userSchema);
