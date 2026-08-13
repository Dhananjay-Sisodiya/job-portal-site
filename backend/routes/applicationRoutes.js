const express = require('express');
const router = express.Router();
const {
  applyToJob, getJobApplications, getMyApplications, updateStatus, analyzeApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:jobId/apply', protect, authorize('jobseeker'), applyToJob);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter'), updateStatus);
router.post('/:id/analyze', protect, analyzeApplication);

module.exports = router;
