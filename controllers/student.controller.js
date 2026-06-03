const db = require('../config/db');
const path = require('path');

// GET /api/student/profile
const getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.name, u.email, s.branch, s.cgpa, s.phone, s.skills, s.resume_url, s.status
             FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ?`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found.' });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// PUT /api/student/profile
const updateProfile = async (req, res) => {
    const { branch, cgpa, phone, skills } = req.body;
    if (cgpa && (cgpa < 0 || cgpa > 10))
        return res.status(400).json({ message: 'CGPA must be between 0 and 10.' });
    try {
        await db.query(
            'UPDATE students SET branch=?, cgpa=?, phone=?, skills=? WHERE user_id=?',
            [branch || '', cgpa || 0, phone || '', skills || '', req.user.id]
        );
        return res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/student/resume  (multer handles file, then we update DB)
const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const resumeUrl = '/uploads/' + req.file.filename;
    try {
        await db.query('UPDATE students SET resume_url=? WHERE user_id=?', [resumeUrl, req.user.id]);
        return res.json({ message: 'Resume uploaded successfully.', resume_url: resumeUrl });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/jobs  - list active jobs the student is eligible for
const getJobs = async (req, res) => {
    try {
        const [student] = await db.query('SELECT cgpa FROM students WHERE user_id=?', [req.user.id]);
        const cgpa = student[0]?.cgpa || 0;
        const [jobs] = await db.query(
            `SELECT jp.*, c.company_name FROM job_postings jp
             JOIN companies c ON jp.company_id = c.id
             WHERE jp.is_active = 1 AND jp.deadline >= CURDATE() AND jp.min_cgpa <= ?
             ORDER BY jp.created_at DESC`,
            [cgpa]
        );
        return res.json(jobs);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/student/apply/:jobId
const applyJob = async (req, res) => {
    const jobId = req.params.jobId;
    try {
        const [student] = await db.query('SELECT id FROM students WHERE user_id=?', [req.user.id]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found.' });
        const studentId = student[0].id;
        const [job] = await db.query('SELECT id, min_cgpa FROM job_postings WHERE id=? AND is_active=1', [jobId]);
        if (job.length === 0) return res.status(404).json({ message: 'Job not found or closed.' });
        const [existing] = await db.query(
            'SELECT id FROM applications WHERE student_id=? AND job_id=?', [studentId, jobId]
        );
        if (existing.length > 0) return res.status(409).json({ message: 'Already applied to this job.' });
        await db.query('INSERT INTO applications (student_id, job_id) VALUES (?, ?)', [studentId, jobId]);
        return res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/applications
const getApplications = async (req, res) => {
    try {
        const [student] = await db.query('SELECT id FROM students WHERE user_id=?', [req.user.id]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found.' });
        const [apps] = await db.query(
            `SELECT a.id, a.status, a.applied_at, jp.title, jp.location, jp.salary, c.company_name
             FROM applications a
             JOIN job_postings jp ON a.job_id = jp.id
             JOIN companies c ON jp.company_id = c.id
             WHERE a.student_id = ? ORDER BY a.applied_at DESC`,
            [student[0].id]
        );
        return res.json(apps);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getProfile, updateProfile, uploadResume, getJobs, applyJob, getApplications };
