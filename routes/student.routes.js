const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { getProfile, updateProfile, uploadResume, getJobs, applyJob, getApplications } = require('../controllers/student.controller');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed.'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(authMiddleware, roleMiddleware('student'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.get('/jobs', getJobs);
router.post('/apply/:jobId', applyJob);
router.get('/applications', getApplications);

module.exports = router;
