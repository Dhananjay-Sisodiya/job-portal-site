const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/geminiService');
const { analyzeWithNLP } = require('../services/nlpService');
const path = require('path');
const fs = require('fs');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId/apply
// @access  Private (Job Seeker)
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resumeId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    // Check duplicate application
    const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      recruiter: job.recruiter,
      resume: resumeId || null,
      coverLetter,
    });

    // Add to job's applications array
    job.applications.push(application._id);
    await job.save({ validateBeforeSave: false });

    // Run AI analysis in background
    if (resumeId) {
      runAIAnalysis(application._id, resumeId, job).catch(console.error);
    }

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.status(201).json({ success: true, application: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Background AI Analysis
const runAIAnalysis = async (applicationId, resumeId, job) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume || !resume.parsedData?.rawText) return;

    const resumeText = resume.parsedData.rawText;
    const jdText = `${job.title}\n${job.description}\n${job.responsibilities?.join('\n')}\n${job.requirements?.join('\n')}`;

    // Run NLP analysis
    const nlpResult = await analyzeWithNLP(resumeText, jdText, job.requiredSkills || []);

    // Run Gemini analysis
    const geminiResult = await analyzeResume(resumeText, jdText, job.requiredSkills || []);

    // Combine scores: 60% Gemini + 40% NLP
    let finalScore = nlpResult.nlpScore;
    let analysis = geminiResult.data;

    if (geminiResult.success) {
      finalScore = Math.round(geminiResult.data.matchScore * 0.6 + nlpResult.nlpScore * 0.4);
      analysis = geminiResult.data;
    }

    await Application.findByIdAndUpdate(applicationId, {
      aiAnalysis: {
        matchScore: finalScore,
        matchedSkills: analysis.matchedSkills || nlpResult.matchedSkills,
        missingSkills: analysis.missingSkills || nlpResult.missingSkills,
        suggestions: analysis.suggestions || [],
        strengths: analysis.strengths || [],
        analysisText: analysis.overallFeedback || '',
        analyzedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('AI Analysis background error:', err.message);
  }
};

// @desc    Get applications for a job (Recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location skills experience education linkedinUrl githubUrl')
      .populate('resume')
      .sort('-appliedAt');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my applications (Job Seeker)
// @route   GET /api/applications/my
// @access  Private (Job Seeker)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location jobType salaryMin salaryMax isActive')
      .populate('resume', 'fileName fileUrl')
      .sort('-appliedAt');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status (Recruiter)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter)
exports.updateStatus = async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;
    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger AI analysis for an application
// @route   POST /api/applications/:id/analyze
// @access  Private
exports.analyzeApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('resume').populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Auth check: recruiter or the applicant
    if (
      application.recruiter.toString() !== req.user.id &&
      application.applicant.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!application.resume || !application.resume.parsedData?.rawText) {
      return res.status(400).json({ success: false, message: 'No resume text available for analysis' });
    }

    const resumeText = application.resume.parsedData.rawText;
    const job = application.job;
    const jdText = `${job.title}\n${job.description}\n${(job.responsibilities || []).join('\n')}\n${(job.requirements || []).join('\n')}`;

    // Run NLP analysis (always runs locally, no quota issues)
    const nlpResult = await analyzeWithNLP(resumeText, jdText, job.requiredSkills || []);

    // Run Gemini analysis (with NLP fallback if quota exceeded)
    const geminiResult = await analyzeResume(resumeText, jdText, job.requiredSkills || []);

    const analysisSource = geminiResult.source || 'nlp-fallback';
    const analysis = geminiResult.data;

    // If Gemini worked → blend: 60% Gemini + 40% NLP
    // If NLP fallback → use fallback score directly (already blended internally)
    let finalScore;
    if (analysisSource === 'gemini') {
      finalScore = Math.round(analysis.matchScore * 0.6 + nlpResult.nlpScore * 0.4);
    } else {
      // nlp-fallback score is already meaningful — just use it
      finalScore = analysis.matchScore || nlpResult.nlpScore;
    }

    const aiAnalysis = {
      matchScore: Math.min(Math.max(finalScore, 0), 100),
      matchedSkills: analysis.matchedSkills?.length ? analysis.matchedSkills : nlpResult.matchedSkills,
      missingSkills: analysis.missingSkills?.length ? analysis.missingSkills : nlpResult.missingSkills,
      suggestions: analysis.suggestions?.length ? analysis.suggestions : [],
      strengths: analysis.strengths?.length ? analysis.strengths : [],
      analysisText: analysis.overallFeedback || '',
      analysisSource,
      analyzedAt: new Date(),
    };

    application.aiAnalysis = aiAnalysis;
    await application.save();

    console.log(`✅ Analysis complete for app ${req.params.id} | Source: ${analysisSource} | Score: ${aiAnalysis.matchScore}`);

    res.status(200).json({
      success: true,
      aiAnalysis,
      nlpDetails: nlpResult,
      analysisSource,
      message: analysisSource === 'nlp-fallback'
        ? 'Analysis completed using NLP (Gemini quota exceeded — NLP fallback active)'
        : `Analysis completed using Gemini AI (${geminiResult.modelUsed || 'gemini'})`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
