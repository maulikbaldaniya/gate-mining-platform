# GATE Mining Engineering (MN) 120-Day Learning Platform
## Architecture & Technical Specification

### 1. System Philosophy
This platform is engineered as a structured, adaptive **120-day GATE Mining Engineering (MN) preparation system**. It takes a student from basic conceptual foundations through 8-level structured Hinglish lessons, daily 10-MCQ topic mastery quizzes, automated weekly test generation, spaced repetition revision, mistake categorization (M1-M6), and personal formula tracking.

---

### 2. High-Level System Architecture

```
+------------------------------------------------------------------+
|                    Browser / Client Device                       |
|               React 18 + Vite + Modern Glassmorphism             |
+---------------------------------+--------------------------------+
                                  | HTTP / REST (JWT Bearer)
                                  v
+------------------------------------------------------------------+
|                    Node.js + Express.js API                      |
|  - Helmet & CORS Headers                                         |
|  - Rate Limiter & Structured Logging (Morgan)                    |
|  - Joi Schema Validation                                         |
|  - Centralized Error Handling                                    |
|                                                                  |
|  [Controllers & Services]                                        |
|  - Auth & User Streaks                                           |
|  - 120-Day Schedule & Topic Progression                          |
|  - 8-Level Hinglish Lesson Engine                                |
|  - 10-MCQ Topic Quiz Mastery & Server-Side Scoring               |
|  - Automated Weekly Test Generator (Completed Topics Only)       |
|  - Ebbinghaus Spaced Revision (+1, +3, +7, +15, +30 Days)        |
|  - Personal Mistake Book (M1 to M6 Taxonomy)                     |
|  - Personal Formula Book & LaTeX Relations                       |
|  - Official GATE Mining PYQ Explorer                             |
+---------------------------------+--------------------------------+
                                  | Sequelize ORM (Transactions)
                                  v
+------------------------------------------------------------------+
|               PostgreSQL Database (Neon / Render)                |
|            (Fallback SQLite for zero-config local dev)           |
|                                                                  |
| 24 Normalized Tables:                                            |
| users, subjects, chapters, topics, subtopics, study_days,        |
| day_topics, lessons, lesson_sections, questions,                 |
| question_options, question_attempts, topic_progress,             |
| daily_progress, weekly_tests, weekly_test_topics,                |
| weekly_test_questions, test_attempts, test_answers,              |
| revision_schedules, mistakes, formula_books, user_streaks,       |
| resources                                                        |
+------------------------------------------------------------------+
```

---

### 3. Content Pipeline (Strictly No Admin Dashboard)

In accordance with product guidelines, the application does not depend on runtime web scrapers or an admin dashboard. Instead, a robust, reproducible data-ingestion pipeline is implemented:

1. **Official Syllabus & Verified Sources**
   - GATE Mining Engineering official organizing institute syllabus.
   - Master subjects: Mining Geology, Mine Development & Surveying, Geomechanics & Ground Control, Mining Methods & Machinery, Mine Ventilation & Hazards, Mineral Economics & Systems Engineering, Engineering Maths, and General Aptitude.
2. **JSON Datasets (`backend/src/seed/data/`)**
   - `subjects.json`, `chapters.json`, `topics.json`: Full syllabus taxonomy.
   - `schedule120.json`: 120-day plan mapped across 18 weeks.
   - `lessons.json`: 8-level structured learning content with Hindi explanation + English technical terms.
   - `questions.json`: 10-MCQ problem sets with full explanations (Why correct, Why wrong, Formula, Common mistake).
   - `pyqs.json`: Authentic past GATE MN questions.
   - `formulas.json`: Master formulas with variables, units, and traps.
3. **Automated Content Validator (`npm run validate-content`)**
   - Checks for missing foreign keys, duplicate questions, orphaned days, invalid options, and missing answers.
4. **Idempotent Seed Runner (`npm run seed`)**
   - Upserts records inside a database transaction without duplicating rows.

---

### 4. Topic Completion & Progression Logic

A topic is **not** completed merely by reading or opening it.
- Candidate reads the 8-level structured lesson.
- Candidate attempts the 10-MCQ Topic Quiz.
- Authoritative backend grading evaluates answers:
  - **$\ge 80\%$ Accuracy**: Topic marked `COMPLETED`. Spaced revision schedule (+1, +3, +7, +15, +30 days) automatically generated.
  - **$60\% - 79\%$ Accuracy**: Topic marked `COMPLETED` + flagged as `Revision Recommended`.
  - **$< 60\%$ Accuracy**: Topic marked `WEAK`. Topic requires review before advancing.
- For every incorrect answer, an automatic record is created in the **Mistake Book** under category `M1` (Concept Not Understood). Candidate can update the category to `M2` (Formula Forgotten), `M3` (Calculation Error), `M4` (Question Misread), `M5` (Time Management), or `M6` (Careless Mistake).

---

### 5. Automated Weekly Test Generation

- **Week Mapping**: Days 1–7 = Week 1, Days 8–14 = Week 2, etc.
- **Eligibility**: Pulls questions strictly from topics **completed by the candidate** in that curriculum week. Incomplete topics are never included.
- **Idempotency**: Checks if a test already exists for `(user_id, week_number)`. If so, returns the existing test to prevent multiple test generations.
- **Timer & Anti-Cheating**: `started_at` and `submitted_at` timestamps are stored on the server to authoritative duration verification.

---

### 6. Security & Production Readiness

- **Passwords**: Hashed with `bcryptjs` using a salt work factor of 10.
- **JWT**: Dual-token strategy with short-lived Access Tokens and long-lived Refresh Tokens.
- **Headers**: Helmet security middleware enabled.
- **CORS**: Configured with origin verification.
- **Rate Limiting**: Express-rate-limit protects auth and API routes.
- **Sequelize Transactions**: Atomic operations for quiz submissions, weekly test generation, and test grading.
