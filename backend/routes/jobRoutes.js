const express = require('express');
const router = express.Router();
const {
  getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs, generateJD,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.post('/generate-jd', protect, authorize('recruiter'), generateJD);
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
