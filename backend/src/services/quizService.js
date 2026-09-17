const db = require('../models');
const { TOPIC_STATUS, TOPIC_THRESHOLDS } = require('../constants/topicStatus');
const { calculateRevisionDate } = require('../utils/dateUtils');
const streakService = require('./streakService');
const logger = require('../utils/logger');

async function getTopicQuiz(topicId, userId) {
  // Fetch up to 10 questions for this topic
  let questions = await db.Question.findAll({
    where: { topic_id: topicId },
    include: [
      {
        model: db.QuestionOption,
        as: 'options',
        attributes: ['id', 'option_key', 'option_text'],
      },
    ],
    limit: 10,
    order: db.sequelize.random(),
  });

  // If fewer than 10 questions seeded for this specific topic, supplement with general subject questions
  if (questions.length === 0) {
    const topic = await db.Topic.findByPk(topicId);
    if (topic) {
      questions = await db.Question.findAll({
        where: { topic_id: 1 }, // Fallback to verified geology/general set
        include: [
          {
            model: db.QuestionOption,
            as: 'options',
            attributes: ['id', 'option_key', 'option_text'],
          },
        ],
        limit: 10,
      });
    }
  }

  // Sanitize: Do not leak correct_answer or explanation to client before submission!
  return questions.map((q) => ({
    id: q.id,
    topic_id: q.topic_id,
    type: q.type,
    difficulty: q.difficulty,
    question_text: q.question_text,
    options: (q.options || []).map((opt) => ({
      id: opt.id,
      option_key: opt.option_key,
      option_text: opt.option_text,
    })),
    is_pyq: q.is_pyq,
    pyq_year: q.pyq_year,
  }));
}

async function submitTopicQuiz(userId, topicId, answers, durationSeconds = 0) {
  const transaction = await db.sequelize.transaction();
  try {
    const questionIds = answers.map((a) => a.questionId);
    const questions = await db.Question.findAll({
      where: { id: questionIds },
      include: [{ model: db.QuestionOption, as: 'options' }],
      transaction,
    });

    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q.id, q));

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const reviewedQuestions = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const isSkipped = !ans.selectedOption || ans.selectedOption.trim() === '';
      const isCorrect = !isSkipped && ans.selectedOption.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();

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
          user_answer: ans.selectedOption || null,
          is_correct: isCorrect,
          time_spent_seconds: ans.timeSpentSeconds || 0,
          attempt_type: 'QUIZ',
        },
        { transaction }
      );

      // If wrong, log into Mistake Book
      if (!isCorrect && !isSkipped) {
        await db.Mistake.create(
          {
            user_id: userId,
            question_id: q.id,
            topic_id: q.topic_id || topicId,
            user_answer: ans.selectedOption,
            correct_answer: q.correct_answer,
            category: 'M1', // Default M1 (Concept not understood), candidate can recategorize
            is_resolved: false,
          },
          { transaction }
        );
      }

      // Build detailed explanation for result
      reviewedQuestions.push({
        id: q.id,
        question_text: q.question_text,
        user_answer: ans.selectedOption || 'Skipped',
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        is_skipped: isSkipped,
        difficulty: q.difficulty,
        explanation: q.explanation_json || {
          concept: 'Standard GATE Mining Theory',
          why_correct: `Option ${q.correct_answer} is mathematically and theoretically verified.`,
        },
      });
    }

    const totalQuestions = answers.length || 10;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const score = correctCount; // 1 mark per correct MCQ

    // Determine Topic Status based on accuracy thresholds
    let newStatus;
    let revisionRecommended = false;

    if (accuracy >= TOPIC_THRESHOLDS.COMPLETION_ACCURACY) {
      newStatus = TOPIC_STATUS.COMPLETED;
    } else if (accuracy >= TOPIC_THRESHOLDS.REVISION_ACCURACY) {
      newStatus = TOPIC_STATUS.COMPLETED;
      revisionRecommended = true;
    } else {
      newStatus = TOPIC_STATUS.WEAK;
    }

    // Update TopicProgress
    const [progress] = await db.TopicProgress.findOrCreate({
      where: { user_id: userId, topic_id: topicId },
      defaults: {
        status: newStatus,
        best_score: accuracy,
        last_score: accuracy,
        attempts_count: 1,
        last_attempted_at: new Date(),
        completed_at: newStatus === TOPIC_STATUS.COMPLETED ? new Date() : null,
      },
      transaction,
    });

    progress.attempts_count += 1;
    progress.last_score = accuracy;
    if (accuracy > progress.best_score) {
      progress.best_score = accuracy;
    }
    // Don't downgrade from COMPLETED to NOT_STARTED, but flag if WEAK
    if (newStatus === TOPIC_STATUS.COMPLETED) {
      progress.status = TOPIC_STATUS.COMPLETED;
      progress.completed_at = progress.completed_at || new Date();
    } else if (newStatus === TOPIC_STATUS.WEAK && progress.status !== TOPIC_STATUS.COMPLETED) {
      progress.status = TOPIC_STATUS.WEAK;
    }
    progress.last_attempted_at = new Date();
    await progress.save({ transaction });

    // Schedule Spaced Revision (+1, +3, +7, +15, +30 days)
    if (newStatus === TOPIC_STATUS.COMPLETED || newStatus === TOPIC_STATUS.WEAK) {
      const existingRevision = await db.RevisionSchedule.findOne({
        where: { user_id: userId, topic_id: topicId, is_completed: false },
        transaction,
      });

      if (!existingRevision) {
        await db.RevisionSchedule.create(
          {
            user_id: userId,
            topic_id: topicId,
            revision_cycle: 1,
            scheduled_date: calculateRevisionDate(0), // +1 day
            is_completed: false,
          },
          { transaction }
        );
      }
    }

    // Update DailyProgress for study days containing this topic
    const dayTopics = await db.DayTopic.findAll({
      where: { topic_id: topicId },
      transaction,
    });

    for (const dt of dayTopics) {
      const dayId = dt.day_id;
      // Check total topics on this day
      const allDt = await db.DayTopic.findAll({ where: { day_id: dayId }, transaction });
      const dtTopicIds = allDt.map((item) => item.topic_id);

      const completedInDay = await db.TopicProgress.count({
        where: {
          user_id: userId,
          topic_id: dtTopicIds,
          status: TOPIC_STATUS.COMPLETED,
        },
        transaction,
      });

      const [dailyProg] = await db.DailyProgress.findOrCreate({
        where: { user_id: userId, day_id: dayId },
        defaults: {
          is_completed: completedInDay >= allDt.length,
          topics_completed_count: completedInDay,
          total_topics_count: allDt.length,
          completed_at: completedInDay >= allDt.length ? new Date() : null,
        },
        transaction,
      });

      dailyProg.topics_completed_count = completedInDay;
      dailyProg.total_topics_count = allDt.length;
      if (completedInDay >= allDt.length) {
        dailyProg.is_completed = true;
        dailyProg.completed_at = dailyProg.completed_at || new Date();
      }
      await dailyProg.save({ transaction });
    }

    await transaction.commit();

    // Update streak asynchronously outside transaction
    await streakService.updateUserStreak(userId).catch((err) => logger.warn('Streak update error:', err));

    return {
      topicId,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      score,
      accuracy,
      durationSeconds,
      topicStatus: newStatus,
      revisionRecommended,
      reviewedQuestions,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Quiz submission error, rolled back:', error);
    throw error;
  }
}

module.exports = {
  getTopicQuiz,
  submitTopicQuiz,
};
