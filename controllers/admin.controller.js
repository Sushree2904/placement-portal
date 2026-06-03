const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const [[{ students }]] = await db.query('SELECT COUNT(*) as students FROM students');
        const [[{ companies }]] = await db.query('SELECT COUNT(*) as companies FROM companies');
        const [[{ jobs }]] = await db.query('SELECT COUNT(*) as jobs FROM job_postings WHERE is_active=1');
        const [[{ applications }]] = await db.query('SELECT COUNT(*) as applications FROM applications');
        const [[{ placed }]] = await db.query("SELECT COUNT(*) as placed FROM students WHERE status='placed'");
        return res.json({ students, companies, jobs, applications, placed });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at, s.branch, s.cgpa, s.status, s.resume_url
             FROM users u JOIN students s ON u.id = s.user_id ORDER BY u.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getAllCompanies = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at, c.company_name, c.website, c.contact_email
             FROM users u JOIN companies c ON u.id = c.user_id ORDER BY u.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getAllJobs = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT jp.*, c.company_name,
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = jp.id) as total_applicants
             FROM job_postings jp JOIN companies c ON jp.company_id = c.id
             ORDER BY jp.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        await db.query('DELETE FROM users WHERE id=? AND role != "admin"', [userId]);
        return res.json({ message: 'User deleted.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getDashboard, getAllStudents, getAllCompanies, getAllJobs, deleteUser };
