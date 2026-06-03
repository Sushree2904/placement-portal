const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { name, email, password, role, company_name } = req.body;
    if (!name || !email || !password || !role)
        return res.status(400).json({ message: 'All fields are required.' });
    if (!['student', 'company'].includes(role))
        return res.status(400).json({ message: 'Role must be student or company.' });
    if (role === 'company' && !company_name)
        return res.status(400).json({ message: 'Company name is required.' });
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0)
            return res.status(409).json({ message: 'Email already registered.' });
        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role]
        );
        const userId = result.insertId;
        if (role === 'student') {
            await db.query('INSERT INTO students (user_id) VALUES (?)', [userId]);
        } else {
            await db.query('INSERT INTO companies (user_id, company_name) VALUES (?, ?)', [userId, company_name]);
        }
        return res.status(201).json({ message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0)
            return res.status(401).json({ message: 'Invalid email or password.' });
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password.' });
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

const me = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
        return res.json(users[0]);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { register, login, me };
