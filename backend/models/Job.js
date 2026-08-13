const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: 'INR' },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    benefits: [{ type: String }],
    applicationDeadline: { type: Date },
    openings: { type: Number, default: 1 },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({
  title: 'text',
  description: 'text',
  requiredSkills: 'text',
  location: 'text',
  company: 'text',
});

module.exports = mongoose.model('Job', jobSchema);
