# PlacementHub — Student Placement Portal

A full-stack campus placement management system built with **Node.js**, **Express**, **MySQL** and **Bootstrap 5**.

## Features

- **3 User Roles** — Student, Company, Admin with JWT-based authentication
- **Student** — Register, update profile, upload PDF resume, browse eligible jobs, apply, track application status
- **Company** — Post job openings with CGPA filter, view applicants ranked by CGPA, shortlist/hire/reject candidates
- **Admin** — Dashboard with live stats, manage all students, companies and job postings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | MySQL (5 tables) |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| Frontend | HTML + Bootstrap 5 |
| Pattern | MVC (Models, Controllers, Routes) |

## Setup Instructions

### 1. Clone and install dependencies
```bash
git clone https://github.com/yourusername/placement-portal
cd placement-portal
npm install
```

### 2. Set up MySQL database
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure environment variables
Edit `.env` with your MySQL credentials:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=placement_portal
JWT_SECRET=your_secret_key_here
```

### 4. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 5. Open in browser
```
http://localhost:3000
```

**Default Admin Login:** admin@portal.com / admin123

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register student or company |
| POST | /api/auth/login | Login and receive JWT |
| GET | /api/auth/me | Get current user info |

### Student (requires student JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/student/profile | Get student profile |
| PUT | /api/student/profile | Update profile |
| POST | /api/student/resume | Upload PDF resume |
| GET | /api/student/jobs | Browse eligible jobs |
| POST | /api/student/apply/:jobId | Apply to a job |
| GET | /api/student/applications | View all applications |

### Company (requires company JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/company/profile | Get company profile |
| PUT | /api/company/profile | Update profile |
| POST | /api/company/jobs | Post a new job |
| GET | /api/company/jobs | Get all posted jobs |
| GET | /api/company/jobs/:jobId/applicants | View job applicants |
| PUT | /api/company/applications/:appId/status | Update application status |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Get platform statistics |
| GET | /api/admin/students | List all students |
| GET | /api/admin/companies | List all companies |
| GET | /api/admin/jobs | List all job postings |

## Project Structure

```
placement-portal/
├── server.js              # Entry point
├── .env                   # Environment variables
├── config/
│   └── db.js              # MySQL connection pool
├── database/
│   └── schema.sql         # All 5 database tables
├── controllers/           # Business logic
│   ├── auth.controller.js
│   ├── student.controller.js
│   ├── company.controller.js
│   └── admin.controller.js
├── middleware/
│   ├── auth.middleware.js  # JWT verification
│   └── role.middleware.js  # Role-based access
├── routes/                # API route definitions
└── public/                # Frontend (HTML + CSS + JS)
    ├── pages/
    │   ├── index.html
    │   ├── login.html
    │   ├── register.html
    │   ├── student-dashboard.html
    │   ├── company-dashboard.html
    │   └── admin-dashboard.html
    ├── css/style.css
    ├── js/auth.js
    └── uploads/           # Resume PDFs stored here
```

---
Built by [Your Name] | Final Year B.Tech | TCS Campus Recruitment 2024
