require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/company', require('./routes/company.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/register.html')));
app.get('/student/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/student-dashboard.html')));
app.get('/company/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/company-dashboard.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/admin-dashboard.html')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
