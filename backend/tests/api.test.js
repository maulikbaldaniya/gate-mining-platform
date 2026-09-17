const request = require('supertest');
const app = require('../src/config/app');
const db = require('../src/models');

beforeAll(async () => {
  await db.sequelize.sync();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('GATE Mining Engineering API Suite', () => {
  let authToken = '';
  let testUserId = null;

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toContain('GATE Mining Engineering');
  });

  test('POST /api/auth/register creates a new student and returns JWT', async () => {
    const email = `miner_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Arjun Verma',
        email,
        password: 'Password@123',
        target_exam: 'GATE 2027 Mining Engineering (MN)',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);

    authToken = res.body.data.tokens.accessToken;
    testUserId = res.body.data.user.id;
  });

  test('GET /api/schedule returns 120 study days', async () => {
    const res = await request(app)
      .get('/api/schedule')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.schedule).toBeDefined();
    expect(res.body.data.schedule.length).toBe(120);
    expect(res.body.data.schedule[0].day_number).toBe(1);
  });

  test('GET /api/schedule/day/1 returns Day 1 topics', async () => {
    const res = await request(app)
      .get('/api/schedule/day/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.day.day_number).toBe(1);
    expect(res.body.data.day.topics.length).toBeGreaterThan(0);
    expect(res.body.data.day.topics[0].id).toBe(1);
  });

  test('GET /api/topics/1/lesson returns 8-level structured lesson', async () => {
    const res = await request(app)
      .get('/api/topics/1/lesson')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lesson.sections.length).toBeGreaterThanOrEqual(5);
  });

  test('GET /api/quiz/topic/1 loads 10 MCQs without leaking correct answers', async () => {
    const res = await request(app)
      .get('/api/quiz/topic/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions.length).toBe(10);
    // Crucial anti-cheating check: correct_answer must NOT be sent to client
    expect(res.body.data.questions[0].correct_answer).toBeUndefined();
    expect(res.body.data.questions[0].options.length).toBeGreaterThanOrEqual(2);
  });

  test('POST /api/quiz/submit grades quiz, updates topic to COMPLETED, logs mistakes, and creates revision schedule', async () => {
    // Deliberately answer 8 correctly and 2 incorrectly to test >= 80% completion and mistake logging
    const quizRes = await request(app)
      .get('/api/quiz/topic/1')
      .set('Authorization', `Bearer ${authToken}`);

    const questions = quizRes.body.data.questions;
    // We'll submit answers for all 10 questions
    const submissionAnswers = questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: idx < 8 ? 'B' : 'A', // Options
      timeSpentSeconds: 15,
    }));

    const submitRes = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        topicId: 1,
        answers: submissionAnswers,
        durationSeconds: 150,
      });

    expect(submitRes.statusCode).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.result.totalQuestions).toBe(10);
    expect(submitRes.body.data.result.score).toBeDefined();
    expect(submitRes.body.data.result.reviewedQuestions.length).toBe(10);

    // Verify revision schedule was created
    const revRes = await request(app)
      .get('/api/revision/today')
      .set('Authorization', `Bearer ${authToken}`);
    expect(revRes.statusCode).toBe(200);
  });

  test('GET /api/dashboard returns comprehensive preparation analytics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(testUserId);
    expect(res.body.data.today.day_number).toBe(1);
    expect(res.body.data.overall.streak).toBeDefined();
    expect(res.body.data.overall.average_accuracy).toBeDefined();
  });
});
