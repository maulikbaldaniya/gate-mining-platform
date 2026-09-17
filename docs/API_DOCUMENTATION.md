# GATE Mining Engineering (MN) 120-Day Platform
## REST API Documentation

### Base URL: `/api`

Standard Response Envelope:
```json
{
  "success": true,
  "message": "Descriptive status message",
  "data": {},
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "details": []
}
```

---

### Authentication Endpoints

#### 1. Register Student
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "password": "Password123",
    "target_exam": "GATE 2027 Mining Engineering (MN)"
  }
  ```
- **Response (201)**: User object and JWT access + refresh tokens.

#### 2. Login Student
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "arjun@example.com",
    "password": "Password123"
  }
  ```
- **Response (200)**: User profile and tokens.

#### 3. Refresh Access Token
- **Endpoint**: `POST /api/auth/refresh`
- **Body**: `{ "refreshToken": "<token>" }`

#### 4. Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

### Dashboard Endpoints

#### 1. Get Candidate Dashboard
- **Endpoint**: `GET /api/dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Aggregated statistics including current day progress, syllabus completion %, revision count, streak metrics, and weekly test availability.

---

### Schedule Endpoints

#### 1. Get 120-Day Master Schedule
- **Endpoint**: `GET /api/schedule`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: All 120 study days grouped by week with user completion flags.

#### 2. Get Study Day Details
- **Endpoint**: `GET /api/schedule/day/:dayNumber`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Day's scheduled topics, sequence, and completion status.

---

### Topic & Lesson Endpoints

#### 1. Get Topic Details
- **Endpoint**: `GET /api/topics/:topicId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Topic metadata, syllabus hierarchy, and user's best score.

#### 2. Get 8-Level Structured Lesson
- **Endpoint**: `GET /api/topics/:topicId/lesson`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 8-level structured learning content with Hindi explanations and English technical terms.

---

### 10-MCQ Topic Quiz Endpoints

#### 1. Fetch 10-MCQ Quiz
- **Endpoint**: `GET /api/quiz/topic/:topicId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 10 questions with options (correct answers are omitted to prevent cheating).

#### 2. Submit 10-MCQ Quiz
- **Endpoint**: `POST /api/quiz/submit`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "topicId": 1,
    "answers": [
      { "questionId": 101, "selectedOption": "B", "timeSpentSeconds": 20 }
    ],
    "durationSeconds": 150
  }
  ```
- **Response**: Score, accuracy %, topic completion status, and structured explanation breakdown.

---

### Weekly Test Endpoints

#### 1. Check Weekly Test Status
- **Endpoint**: `GET /api/tests/weekly/status?weekNumber=1`
- **Headers**: `Authorization: Bearer <token>`

#### 2. Generate Weekly Test
- **Endpoint**: `POST /api/tests/weekly/generate`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "weekNumber": 1 }`

#### 3. Start Timed Weekly Test
- **Endpoint**: `POST /api/tests/weekly/:testId/start`
- **Headers**: `Authorization: Bearer <token>`

#### 4. Submit Weekly Test
- **Endpoint**: `POST /api/tests/weekly/:testId/submit`
- **Headers**: `Authorization: Bearer <token>`

---

### Spaced Revision Endpoints

#### 1. Get Today's Revisions Due
- **Endpoint**: `GET /api/revision/today`
- **Headers**: `Authorization: Bearer <token>`

#### 2. Mark Revision Complete
- **Endpoint**: `POST /api/revision/:revisionId/complete`
- **Headers**: `Authorization: Bearer <token>`

---

### Mistake Book Endpoints

#### 1. Get Categorized Mistakes
- **Endpoint**: `GET /api/mistakes?category=M1&is_resolved=false&page=1&limit=20`
- **Headers**: `Authorization: Bearer <token>`

#### 2. Update Mistake Category / Notes
- **Endpoint**: `PATCH /api/mistakes/:mistakeId`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "category": "M3",
    "user_notes": "Forgot to divide by rock density to convert volume into tonnes.",
    "is_resolved": true
  }
  ```

---

### Formula Book Endpoints

#### 1. Get Formulas
- **Endpoint**: `GET /api/formulas?search=Atkinson`
- **Headers**: `Authorization: Bearer <token>`

#### 2. Toggle Bookmark
- **Endpoint**: `POST /api/formulas/toggle-bookmark`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "title": "Atkinson's Law", "topic_id": 36 }`

---

### GATE PYQ Endpoints

#### 1. Get Filtered Past Papers
- **Endpoint**: `GET /api/pyqs?year=2023&topicId=1`
- **Headers**: `Authorization: Bearer <token>`
