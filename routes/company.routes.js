const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { getProfile, updateProfile, postJob, getMyJobs, getApplicants, updateApplicationStatus, toggleJob } = require('../controllers/company.controller');

router.use(authMiddleware, roleMiddleware('company'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/jobs', postJob);
router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applicants', getApplicants);
router.put('/applications/:appId/status', updateApplicationStatus);
router.put('/jobs/:jobId/toggle', toggleJob);

module.exports = router;
