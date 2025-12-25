// server/models/FreelancerProfile.js
const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema(
  {
    // Link to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Profile info
    title: {
      type: String,
      maxlength: 100,
    },

    bio: {
      type: String,
      maxlength: 1000,
    },

    // Skills
    skills: [String],

    // Expertise areas
    expertise: [String],

    // Location & Languages
    location: {
      type: String,
      maxlength: 200,
    },

    languages: [String],

    // Availability type (Full-time, Part-time, Contract, Freelance)
    availability: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
      default: 'Part-time',
    },

    // Work Experience
    workExperience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    hourlyRate: Number,
    minimumProjectSize: {
      type: Number,
      default: 100,
    },

    // Experience level
    experience: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'expert'],
      default: 'junior',
    },

    // Experience
    completedJobs: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    // Ratings
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

    responseRate: {
      type: Number,
      default: 0,
    },

    responseTime: {
      type: Number, // In hours
    },

    // Portfolio
    portfolio: [
      {
        title: String,
        description: String,
        image: String,
        url: String,
        category: String,
      },
    ],

    // Certifications
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        url: String,
      },
    ],

    // Verification
    verified: {
      type: Boolean,
      default: false,
    },

    verificationDate: Date,
    verificationNotes: String,

    // Availability
    available: {
      type: Boolean,
      default: true,
    },

    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'not-available'],
      default: 'available',
    },

    // Metadata
    successRate: {
      type: Number,
      default: 0,
    },

    repeatClients: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index
// Note: userId has unique: true which creates an index automatically, don't duplicate
freelancerProfileSchema.index({ verified: 1, averageRating: -1 });
freelancerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
