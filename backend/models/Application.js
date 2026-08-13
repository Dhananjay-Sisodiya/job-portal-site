const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },
    aiAnalysis: {
      matchScore: { type: Number, min: 0, max: 100 },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      suggestions: [{ type: String }],
      strengths: [{ type: String }],
      analysisText: { type: String },
      analysisSource: { type: String, enum: ['gemini', 'nlp-fallback', 'template'], default: 'nlp-fallback' },
      analyzedAt: { type: Date },
    },
    recruiterNotes: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
