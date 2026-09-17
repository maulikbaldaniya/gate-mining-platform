# GATE Mining Engineering (MN) 120-Day Learning Platform

A full-stack, production-grade educational web application tailored specifically for **GATE Mining Engineering (MN)** aspirants. Designed to take a student from zero foundation to exam readiness through a database-driven 120-day curriculum, 8-level structured Hinglish lessons, daily 10-MCQ mastery quizzes, automated weekly test generation, spaced repetition, an M1–M6 mistake notebook, and a personal formula repository.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **HTTP Client**: Centralized Axios with JWT interceptors & token auto-refresh
- **Styling**: Vanilla CSS modern design system (Glassmorphism, curated tokens, responsive layouts, micro-animations)
- **Icons & Effects**: Lucide React, Canvas Confetti

### Backend
- **Runtime**: Node.js (ES6+)
- **Framework**: Express.js REST API
- **Database & ORM**: PostgreSQL + Sequelize ORM (with multi-dialect support for seamless local development)
- **Security**: Helmet, CORS, Express-Rate-Limit, JWT dual tokens, bcryptjs password hashing
- **Validation**: Joi request schema validation

### Content Ingestion System (Strictly No Admin Dashboard)
All curriculum topics, 8-level lessons, 10-MCQ sets, verified GATE PYQs, and formulas are managed strictly via versioned seed data in `backend/src/seed/data/`. Integrity is verified using `npm run validate-content` and loaded idempotently using `npm run seed`.

---

## Directory Structure

```
d:/GATE MINING ENGINEERING/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, Express app, rate limiters
│   │   ├── constants/       # M1-M6 mistake types, topic statuses, question types
│   │   ├── controllers/     # Auth, Dashboard, Schedule, Topic, Quiz, Test, etc.
│   │   ├── middlewares/     # JWT Auth, centralized error handling, request validators
│   │   ├── migrations/      # Table schema synchronizer & migration runner
│   │   ├── models/          # 24 Sequelize models and relationship mappings
│   │   ├── routes/          # REST route handlers
│   │   ├── seed/            # Idempotent seed runner & validator
│   │   │   └── data/        # JSON datasets (120-Day schedule, PYQs, MCQs, formulas)
│   │   ├── services/        # Business logic: quiz engine, test generator, revision
│   │   ├── utils/           # API response helper, structured logger, date math
│   │   └── server.js        # Backend entry point
│   ├── tests/               # Jest integration tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI, Navbar, Sidebar, ProgressBars, Cards
│   │   ├── context/         # AuthContext (session persistence & token lifecycle)
│   │   ├── pages/           # Dashboard, Schedule, Topic, Quiz, WeeklyTests, etc.
│   │   ├── services/        # Client API services (Axios)
│   │   ├── styles/          # Design system stylesheet (index.css)
│   │   ├── App.jsx          # Protected route declarations
│   │   └── main.jsx         # React DOM root
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system specification & ER diagram
│   └── API_DOCUMENTATION.md # REST endpoint documentation & schemas
├── package.json             # Root monorepo orchestration scripts
└── README.md
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0+ (Installed: v24.18.0)
- **npm**: v9.0+ (Installed: 11.16.0)
- **Database**: PostgreSQL (Neon connection string or local Postgres) or zero-config SQLite default.

### 2. Environment Configuration
Copy environment files:
```bash
# In backend/
cp .env.example .env

# In frontend/
cp .env.example .env
```

If connecting to Neon PostgreSQL, set `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/gatemining?sslmode=require
DB_DIALECT=postgres
```

### 3. Database Migration & Seeding
```bash
cd backend
npm run migrate           # Creates and verifies all 24 database tables
npm run validate-content  # Verifies integrity of official GATE MN seed files
npm run seed              # Populates subjects, 120-day schedule, lessons, MCQs, and PYQs
```

### 4. Running the Tests
```bash
cd backend
npm test
```
Runs the Jest integration test suite verifying authentication, 120-day schedule retrieval, 8-level lessons, anti-cheating 10-MCQ quizzes, and authoritative scoring transactions.

### 5. Starting the Development Servers
From the project root:
```bash
npm run dev
```
Or start individually:
- Backend: `cd backend && npm run dev` (Runs on `http://localhost:5000`)
- Frontend: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

---

## Production Build & Deployment Guide

### Frontend Deployment (Vercel)
1. Link your Git repository on Vercel.
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm run build`.
4. Set Output Directory to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL`: Your hosted backend API URL (e.g. `https://gate-mining-api.onrender.com/api`).

### Backend Deployment (Render / Railway)
1. Set Root Directory to `backend`.
2. Build Command: `npm install && npm run migrate && npm run seed`.
3. Start Command: `npm start`.
4. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=postgresql://...` (from Neon PostgreSQL)
   - `JWT_ACCESS_SECRET=your_secure_access_secret`
   - `JWT_REFRESH_SECRET=your_secure_refresh_secret`
   - `CLIENT_URL=https://your-app.vercel.app`

---

## Key Features & Business Rules

1. **Strictly Official Syllabus**: Master curriculum reflects the official GATE Mining Engineering paper across all core sections: Mining Geology & Development, Mine Surveying, Geomechanics & Ground Control, Mining Methods & Machinery, Ventilation & Environmental Hazards, Mineral Economics & Systems Engineering, Engineering Mathematics, and General Aptitude.
2. **Server-Side Topic Mastery**:
   - $\ge 80\%$: Marked `COMPLETED`, automatically enters the Spaced Repetition cycle (+1, +3, +7, +15, +30 days).
   - $60\% - 79\%$: Marked `COMPLETED` with revision recommendation.
   - $< 60\%$: Marked `WEAK`.
3. **M1–M6 Mistake Notebook**: Wrong answers are automatically captured and categorized into M1 (Concept), M2 (Formula), M3 (Calculation), M4 (Question Misread), M5 (Time Management), or M6 (Careless Error).
4. **Idempotent Weekly Test Engine**: Tests are generated strictly from topics the candidate has completed for that week. Incomplete topics are excluded.
5. **Session & Refresh Resilience**: Candidate sessions, quiz timers, and progress states are persisted in PostgreSQL.
