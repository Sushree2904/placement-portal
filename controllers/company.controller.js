const db = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.name, u.email, c.id as company_id, c.company_name, c.description, c.website, c.contact_email
             FROM users u JOIN companies c ON u.id = c.user_id WHERE u.id = ?`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Company not found.' });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const updateProfile = async (req, res) => {
    const { company_name, description, website, contact_email } = req.body;
    try {
        await db.query(
            'UPDATE companies SET company_name=?, description=?, website=?, contact_email=? WHERE user_id=?',
            [company_name, description || '', website || '', contact_email || '', req.user.id]
        );
        return res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const postJob = async (req, res) => {
    const { title, description, location, salary, min_cgpa, deadline } = req.body;
    if (!title || !description || !deadline)
        return res.status(400).json({ message: 'Title, description and deadline are required.' });
    try {
        const [company] = await db.query('SELECT id FROM companies WHERE user_id=?', [req.user.id]);
        if (company.length === 0) return res.status(404).json({ message: 'Company not found.' });
        await db.query(
            'INSERT INTO job_postings (company_id, title, description, location, salary, min_cgpa, deadline) VALUES (?,?,?,?,?,?,?)',
            [company[0].id, title, description, location || 'Any', salary || 'Not disclosed', min_cgpa || 0, deadline]
        );
        return res.status(201).json({ message: 'Job posted successfully!' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getMyJobs = async (req, res) => {
    try {
        const [company] = await db.query('SELECT id FROM companies WHERE user_id=?', [req.user.id]);
        if (company.length === 0) return res.status(404).json({ message: 'Company not found.' });
        const [jobs] = await db.query(
            'SELECT * FROM job_postings WHERE company_id=? ORDER BY created_at DESC', [company[0].id]
        );
        return res.json(jobs);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getApplicants = async (req, res) => {
    const jobId = req.params.jobId;
    try {
        const [company] = await db.query('SELECT id FROM companies WHERE user_id=?', [req.user.id]);
        const [apps] = await db.query(
            `SELECT a.id, a.status, a.applied_at, u.name, u.email, s.branch, s.cgpa, s.phone, s.skills, s.resume_url
             FROM applications a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE a.job_id = ? ORDER BY s.cgpa DESC`,
            [jobId]
        );
        return res.json(apps);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    const appId = req.params.appId;
    const validStatuses = ['shortlisted', 'rejected', 'hired', 'applied'];
    if (!validStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status.' });
    try {
        await db.query('UPDATE applications SET status=? WHERE id=?', [status, appId]);
        if (status === 'hired') {
            const [app] = await db.query('SELECT student_id FROM applications WHERE id=?', [appId]);
            if (app.length > 0) {
                await db.query('UPDATE students SET status="placed" WHERE id=?', [app[0].student_id]);
            }
        }
        return res.json({ message: 'Application status updated.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const toggleJob = async (req, res) => {
    const jobId = req.params.jobId;
    try {
        await db.query('UPDATE job_postings SET is_active = NOT is_active WHERE id=?', [jobId]);
        return res.json({ message: 'Job status toggled.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getProfile, updateProfile, postJob, getMyJobs, getApplicants, updateApplicationStatus, toggleJob };
