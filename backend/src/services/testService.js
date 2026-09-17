const { Op } = require('sequelize');
const db = require('../models');
const { getWeekNumberForDay } = require('../utils/dateUtils');
const logger = require('../utils/logger');

async function getWeeklyTestStatus(userId, weekNumber = 1) {
  // Find existing test
  const existingTest = await db.WeeklyTest.findOne({
    where: { user_id: userId, week_number: weekNumber },
    include: [
      {
        model: db.WeeklyTestTopic,
        as: 'testTopics',
        include: [{ model: db.Topic, as: 'topic', attributes: ['id', 'name'] }],
      },
    ],
  });

  if (existingTest) {
    return {
      available: true,
      exists: true,
      test: existingTest,
      completedTopicsCount: existingTest.testTopics ? existingTest.testTopics.length : 0,
    };
  }

  // Calculate completed topics for this week
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber * 7;

  const studyDays = await db.StudyDay.findAll({
    where: {
      day_number: {
        [Op.between]: [startDay, endDay],
      },
    },
    include: [{ model: db.DayTopic, as: 'dayTopics' }],
  });

  const weekTopicIds = [];
  studyDays.forEach((sd) => {
    (sd.dayTopics || []).forEach((dt) => weekTopicIds.push(dt.topic_id));
  });

  const uniqueWeekTopicIds = [...new Set(weekTopicIds)];

  // Get user's completed topics in this set
  const completedProgress = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      topic_id: uniqueWeekTopicIds,
      status: 'COMPLETED',
    },
  });

  const completedTopicIds = completedProgress.map((cp) => cp.topic_id);

  return {
    available: completedTopicIds.length > 0,
    exists: false,
    weekNumber,
    completedTopicsCount: completedTopicIds.length,
    eligibleTopicIds: completedTopicIds,
  };
}

async function generateWeeklyTest(userId, weekNumber = 1) {
  // Idempotent check: If test already generated, return existing
  const existingTest = await db.WeeklyTest.findOne({
    where: { user_id: userId, week_number: weekNumber },
  });
  if (existingTest) {
    return existingTest;
  }

  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber * 7;

  const studyDays = await db.StudyDay.findAll({
    where: {
      day_number: {
        [Op.between]: [startDay, endDay],
      },
    },
    include: [{ model: db.DayTopic, as: 'dayTopics' }],
  });

  const weekTopicIds = [];
  studyDays.forEach((sd) => {
    (sd.dayTopics || []).forEach((dt) => weekTopicIds.push(dt.topic_id));
  });
  const uniqueWeekTopicIds = [...new Set(weekTopicIds)];

  // Only take topics actually completed by the candidate
  const completedProgress = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      topic_id: uniqueWeekTopicIds,
      status: 'COMPLETED',
    },
  });

  const completedTopicIds = completedProgress.map((cp) => cp.topic_id);

  if (completedTopicIds.length === 0) {
    const error = new Error(`Cannot generate Weekly Test ${weekNumber}: No topics have been completed for Week ${weekNumber} yet.`);
    error.statusCode = 400;
    error.errorCode = 'NO_COMPLETED_TOPICS';
    throw error;
  }

  const transaction = await db.sequelize.transaction();
  try {
    const totalQuestionsWanted = Math.min(completedTopicIds.length * 5, 20); // 5 questions per topic, max 20
    const questionsPerTopic = Math.max(1, Math.floor(totalQuestionsWanted / completedTopicIds.length));

    const selectedQuestions = [];

    for (const topicId of completedTopicIds) {
      const questions = await db.Question.findAll({
        where: { topic_id: topicId },
        limit: questionsPerTopic,
        order: db.sequelize.random(),
        transaction,
      });
      selectedQuestions.push(...questions);
    }

    // Fallback if topics had few questions
    if (selectedQuestions.length === 0) {
      const fallbackQuestions = await db.Question.findAll({
        limit: 10,
        order: db.sequelize.random(),
        transaction,
      });
      selectedQuestions.push(...fallbackQuestions);
    }

    const test = await db.WeeklyTest.create(
      {
        user_id: userId,
        week_number: weekNumber,
        title: `Week ${weekNumber} Comprehensive Test`,
        total_questions: selectedQuestions.length,
        time_limit_minutes: Math.max(15, selectedQuestions.length * 1.5),
        is_submitted: false,
      },
      { transaction }
    );

    // Save test topics
    for (const topicId of completedTopicIds) {
      await db.WeeklyTestTopic.create(
        {
          weekly_test_id: test.id,
          topic_id: topicId,
        },
        { transaction }
      );
    }

    // Save test questions
    for (let i = 0; i < selectedQuestions.length; i++) {
      await db.WeeklyTestQuestion.create(
        {
          weekly_test_id: test.id,
          question_id: selectedQuestions[i].id,
          order_index: i + 1,
        },
        { transaction }
      );
    }

    await transaction.commit();
    return test;
  } catch (err) {
    await transaction.rollback();
    logger.error('Error generating weekly test:', err);
    throw err;
  }
}

async function startWeeklyTest(userId, testId) {
  const test = await db.WeeklyTest.findOne({
    where: { id: testId, user_id: userId },
    include: [
      {
        model: db.WeeklyTestQuestion,
        as: 'testQuestions',
        include: [
          {
            model: db.Question,
            as: 'question',
            include: [
              {
                model: db.QuestionOption,
                as: 'options',
                attributes: ['id', 'option_key', 'option_text'],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!test) {
    const error = new Error('Weekly test not found');
    error.statusCode = 404;
    throw error;
  }

  if (test.is_submitted) {
    const error = new Error('This test has already been submitted');
    error.statusCode = 400;
    throw error;
  }

  if (!test.started_at) {
    test.started_at = new Date();
    await test.save();
  }

  return {
    id: test.id,
    title: test.title,
    week_number: test.week_number,
    total_questions: test.total_questions,
    time_limit_minutes: test.time_limit_minutes,
    started_at: test.started_at,
    questions: (test.testQuestions || []).map((tq) => ({
      id: tq.question.id,
      order_index: tq.order_index,
      type: tq.question.type,
      difficulty: tq.question.difficulty,
      question_text: tq.question.question_text,
      options: (tq.question.options || []).map((o) => ({
        id: o.id,
        option_key: o.option_key,
        option_text: o.option_text,
      })),
    })),
  };
}

async function submitWeeklyTest(userId, testId, answers = []) {
  const transaction = await db.sequelize.transaction();
  try {
    const test = await db.WeeklyTest.findOne({
      where: { id: testId, user_id: userId },
      transaction,
    });

    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = 404;
      throw error;
    }

    if (test.is_submitted) {
      const error = new Error('Test has already been submitted');
      error.statusCode = 400;
      throw error;
    }

    const testQuestions = await db.WeeklyTestQuestion.findAll({
      where: { weekly_test_id: test.id },
      include: [{ model: db.Question, as: 'question' }],
      transaction,
    });

    const questionMap = new Map();
    testQuestions.forEach((tq) => questionMap.set(tq.question_id, tq.question));

    const submittedAt = new Date();
    const durationSeconds = test.started_at
      ? Math.max(0, Math.round((submittedAt - new Date(test.started_at)) / 1000))
      : 0;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const reviewedAnswers = [];

    const answerMap = new Map();
    answers.forEach((a) => answerMap.set(a.questionId, a.selectedOption));

    for (const tq of testQuestions) {
      const q = tq.question;
      const selectedOption = answerMap.get(q.id);
      const isSkipped = !selectedOption || selectedOption.trim() === '';
      const isCorrect = !isSkipped && selectedOption.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      // Record Question Attempt
      await db.QuestionAttempt.create(
        {
          user_id: userId,
          question_id: q.id,
          user_answer: selectedOption || null,
          is_correct: isCorrect,
          attempt_type: 'WEEKLY_TEST',
          related_attempt_id: test.id,
        },
        { transaction }
      );

      // Log incorrect questions into Mistake Notebook
      if (!isCorrect && !isSkipped) {
        await db.Mistake.create(
          {
            user_id: userId,
            question_id: q.id,
            topic_id: q.topic_id,
            user_answer: selectedOption,
            correct_answer: q.correct_answer,
            category: 'M5', // Default M5 (Time-management error) in weekly tests
            is_resolved: false,
          },
          { transaction }
        );
      }

      reviewedAnswers.push({
        questionId: q.id,
        question_text: q.question_text,
        user_answer: selectedOption || 'Skipped',
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        is_skipped: isSkipped,
        explanation: q.explanation_json,
      });
    }

    const totalQ = testQuestions.length || 1;
    const accuracy = Math.round((correctCount / totalQ) * 100);
    const score = correctCount;

    // Create TestAttempt
    const attempt = await db.TestAttempt.create(
      {
        user_id: userId,
        weekly_test_id: test.id,
        started_at: test.started_at || submittedAt,
        submitted_at: submittedAt,
        duration_seconds: durationSeconds,
        total_questions: totalQ,
        attempted_count: correctCount + wrongCount,
        correct_count: correctCount,
        wrong_count: wrongCount,
        skipped_count: skippedCount,
        score,
        accuracy,
      },
      { transaction }
    );

    test.is_submitted = true;
    test.submitted_at = submittedAt;
    test.score = score;
    test.accuracy = accuracy;
    await test.save({ transaction });

    await transaction.commit();

    return {
      attemptId: attempt.id,
      testId: test.id,
      weekNumber: test.week_number,
      totalQuestions: totalQ,
      correctCount,
      wrongCount,
      skippedCount,
      score,
      accuracy,
      durationSeconds,
      reviewedAnswers,
    };
  } catch (err) {
    await transaction.rollback();
    logger.error('Error submitting weekly test:', err);
    throw err;
  }
}

module.exports = {
  getWeeklyTestStatus,
  generateWeeklyTest,
  startWeeklyTest,
  submitWeeklyTest,
};
