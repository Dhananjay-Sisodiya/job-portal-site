const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    fileSize: { type: Number },
    parsedData: {
      rawText: { type: String },
      extractedSkills: [{ type: String }],
      extractedExperience: { type: String },
      extractedEducation: [{ type: String }],
      extractedEmail: { type: String },
      extractedPhone: { type: String },
      extractedName: { type: String },
      workExperience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      totalYearsExperience: { type: Number, default: 0 },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
