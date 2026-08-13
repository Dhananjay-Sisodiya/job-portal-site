const Resume = require('../models/Resume');
const User = require('../models/User');
const { extractResumeText } = require('../services/nlpService');
const { extractResumeData } = require('../services/geminiService');
const path = require('path');
const fs = require('fs');

// @desc    Upload resume
// @route   POST /api/resume/upload
// @access  Private (Job Seeker)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    // Extract text from resume
    const textResult = await extractResumeText(filePath);
    let parsedData = { rawText: '' };

    if (textResult.success) {
      parsedData.rawText = textResult.text;

      // Use Gemini to extract structured data
      const geminiResult = await extractResumeData(textResult.text);
      if (geminiResult.success) {
        parsedData = {
          ...parsedData,
          extractedSkills: geminiResult.data.skills || [],
          extractedExperience: `${geminiResult.data.totalYearsExperience || 0} years`,
          extractedEducation: geminiResult.data.education || [],
          extractedEmail: geminiResult.data.email,
          extractedPhone: geminiResult.data.phone,
          extractedName: geminiResult.data.name,
          workExperience: geminiResult.data.workExperience || [],
          totalYearsExperience: geminiResult.data.totalYearsExperience || 0,
        };

        // Update user's skills if parsed
        if (geminiResult.data.skills?.length > 0) {
          await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { skills: { $each: geminiResult.data.skills } },
          });
        }
      }
    }

    const fileUrl = `/uploads/${path.basename(filePath)}`;
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileUrl,
      fileType: ext,
      fileSize: req.file.size,
      parsedData,
      isDefault: true,
    });

    // Set all other resumes as non-default
    await Resume.updateMany(
      { user: req.user.id, _id: { $ne: resume._id } },
      { isDefault: false }
    );

    // Update user's resumeUrl
    await User.findByIdAndUpdate(req.user.id, { resumeUrl: fileUrl });

    res.status(201).json({
      success: true,
      resume,
      parsedSkills: parsedData.extractedSkills || [],
    });
  } catch (error) {
    console.error('Resume upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my resumes
// @route   GET /api/resume/my
// @access  Private
exports.getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resume
// @route   GET /api/resume/:id
// @access  Private
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('user', 'name email');
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    // Allow recruiter or the owner
    if (resume.user._id.toString() !== req.user.id && req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await resume.deleteOne();
    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set resume as default
// @route   PUT /api/resume/:id/set-default
// @access  Private
exports.setDefault = async (req, res) => {
  try {
    await Resume.updateMany({ user: req.user.id }, { isDefault: false });
    const resume = await Resume.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
