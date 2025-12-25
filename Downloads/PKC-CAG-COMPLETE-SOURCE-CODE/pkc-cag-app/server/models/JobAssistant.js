const mongoose = require('mongoose');

const jobAssistantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    interestedRoles: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      enum: ['0-1 years', '1-2 years', '2-5 years', '5-10 years', '10+ years'],
      default: '',
    },
    currentRole: {
      type: String,
      default: 'Student/Fresher',
    },
    skills: {
      type: String,
      required: true,
      trim: true,
    },
    linkedinProfile: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'contacted'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    isContacted: {
      type: Boolean,
      default: false,
    },
    contactedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobAssistant', jobAssistantSchema);
