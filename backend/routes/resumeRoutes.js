const express = require('express');
const router = express.Router();
const {
  uploadResume, getMyResumes, getResume, deleteResume, setDefault,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/my', protect, getMyResumes);
router.get('/:id', protect, getResume);
router.delete('/:id', protect, deleteResume);
router.put('/:id/set-default', protect, setDefault);

module.exports = router;
