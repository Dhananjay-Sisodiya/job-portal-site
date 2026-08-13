const Job = require('../models/Job');
const Application = require('../models/Application');
const { generateJobDescription } = require('../services/geminiService');

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const {
      search, location, jobType, experienceLevel,
      skills, page = 1, limit = 10, sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      query.requiredSkills = { $in: skillsArr.map((s) => new RegExp(s, 'i')) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name company email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter', 'name company email profilePicture companyDescription companyWebsite'
    );

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Increment view count
    job.views += 1;
    await job.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Recruiter)
exports.createJob = async (req, res) => {
  try {
    req.body.recruiter = req.user.id;
    if (!req.body.company) req.body.company = req.user.company;

    const job = await Job.create(req.body);
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter - owner)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter - owner)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort('-createdAt')
      .populate('applications');

    const jobsWithStats = jobs.map((job) => ({
      ...job.toObject(),
      applicationCount: job.applications.length,
    }));

    res.status(200).json({ success: true, count: jobs.length, jobs: jobsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate JD using Gemini AI
// @route   POST /api/jobs/generate-jd
// @access  Private (Recruiter)
exports.generateJD = async (req, res) => {
  try {
    const { jobTitle, skills, experience, jobType, company } = req.body;

    if (!jobTitle || !skills) {
      return res.status(400).json({ success: false, message: 'Job title and skills are required' });
    }

    const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    const result = await generateJobDescription(
      jobTitle, skillsArray, experience || 'mid-level', jobType || 'full-time',
      company || req.user.company || 'Our Company'
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate JD', error: result.error });
    }

    res.status(200).json({ success: true, generatedJD: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
