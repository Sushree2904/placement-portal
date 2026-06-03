const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { getDashboard, getAllStudents, getAllCompanies, getAllJobs, deleteUser } = require('../controllers/admin.controller');

router.use(authMiddleware, roleMiddleware('admin'));
router.get('/dashboard', getDashboard);
router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.get('/jobs', getAllJobs);
router.delete('/users/:userId', deleteUser);

module.exports = router;
