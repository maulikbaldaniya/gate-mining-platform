const { Op } = require('sequelize');
const db = require('../models');
const { TOPIC_STATUS } = require('../constants/topicStatus');

async function getDashboardSummary(userId) {
  const user = await db.User.findByPk(userId);
  const currentDayNumber = user.current_day || 1;

  // 1. Current Day Progress
  const currentDay = await db.StudyDay.findOne({
    where: { day_number: currentDayNumber },
    include: [
      {
        model: db.DayTopic,
        as: 'dayTopics',
        include: [{ model: db.Topic, as: 'topic', attributes: ['id', 'name', 'code'] }],
      },
    ],
  });

  const dayTopicIds = currentDay && currentDay.dayTopics ? currentDay.dayTopics.map((dt) => dt.topic_id) : [];

  const dayProgressList = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      topic_id: dayTopicIds,
    },
  });
  const dayProgressMap = new Map();
  dayProgressList.forEach((dp) => dayProgressMap.set(dp.topic_id, dp.status));

  const todayTopics = (currentDay && currentDay.dayTopics ? currentDay.dayTopics : []).map((dt) => ({
    id: dt.topic_id,
    name: dt.topic ? dt.topic.name : 'Topic',
    code: dt.topic ? dt.topic.code : null,
    sequence: dt.sequence,
    estimated_minutes: dt.estimated_minutes,
    status: dayProgressMap.get(dt.topic_id) || 'NOT_STARTED',
    is_completed: dayProgressMap.get(dt.topic_id) === 'COMPLETED',
  }));

  const todayCompletedCount = todayTopics.filter((t) => t.is_completed).length;
  const todayTotalCount = todayTopics.length;
  const dayProgressPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // 2. Overall Syllabus Progress
  const totalTopics = await db.Topic.count();
  const completedTopicsCount = await db.TopicProgress.count({
    where: { user_id: userId, status: TOPIC_STATUS.COMPLETED },
  });
  const syllabusPercent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  // 3. Questions Solved & Accuracy
  const attempts = await db.QuestionAttempt.findAll({
    where: { user_id: userId },
    attributes: ['is_correct', 'attempt_type'],
  });
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const pyqsSolved = attempts.filter((a) => a.attempt_type === 'PYQ' || a.attempt_type === 'PRACTICE').length;

  // 4. Today's Revision Count
  const todayStr = new Date().toISOString().split('T')[0];
  const revisionDueCount = await db.RevisionSchedule.count({
    where: {
      user_id: userId,
      is_completed: false,
      scheduled_date: { [Op.lte]: todayStr },
    },
  });

  // 5. Weak Topics Count & List
  const weakTopics = await db.TopicProgress.findAll({
    where: { user_id: userId, status: TOPIC_STATUS.WEAK },
    include: [{ model: db.Topic, as: 'topic', attributes: ['id', 'name', 'subject_id'] }],
    limit: 5,
  });

  // 6. User Streak
  const streak = await db.UserStreak.findOne({ where: { user_id: userId } });

  // 7. Weekly Test Availability
  const currentWeekNumber = Math.ceil(currentDayNumber / 7);
  const existingTest = await db.WeeklyTest.findOne({
    where: { user_id: userId, week_number: currentWeekNumber },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      current_day: currentDayNumber,
      target_exam: user.target_exam,
    },
    today: {
      day_number: currentDayNumber,
      title: currentDay ? currentDay.title : `Day ${currentDayNumber}`,
      description: currentDay ? currentDay.description : '',
      topics: todayTopics,
      completed_count: todayCompletedCount,
      total_count: todayTotalCount,
      progress_percent: dayProgressPercent,
      is_day_completed: todayTotalCount > 0 && todayCompletedCount === todayTotalCount,
    },
    overall: {
      syllabus_percent: syllabusPercent,
      completed_topics: completedTopicsCount,
      total_topics: totalTopics,
      mcqs_solved: totalAttempts,
      pyqs_solved: pyqsSolved,
      average_accuracy: overallAccuracy,
      revision_due_count: revisionDueCount,
      weak_topics_count: weakTopics.length,
      weak_topics: weakTopics.map((w) => ({
        id: w.topic_id,
        name: w.topic ? w.topic.name : 'Weak Topic',
        best_score: w.best_score,
      })),
      streak: streak
        ? {
            current: streak.current_streak,
            longest: streak.longest_streak,
            total_days: streak.total_days_studied,
            badges: streak.badges || [],
          }
        : { current: 1, longest: 1, total_days: 1, badges: [] },
      weekly_test: {
        week_number: currentWeekNumber,
        is_available: todayCompletedCount > 0 || completedTopicsCount > 0,
        is_submitted: existingTest ? existingTest.is_submitted : false,
        test_id: existingTest ? existingTest.id : null,
      },
    },
  };
}

async function getSubjectProgress(userId) {
  const subjects = await db.Subject.findAll({
    order: [['order_index', 'ASC']],
    include: [
      {
        model: db.Topic,
        as: 'topics',
        attributes: ['id', 'name'],
      },
    ],
  });

  const userProgress = await db.TopicProgress.findAll({
    where: { user_id: userId },
  });
  const progressMap = new Map();
  userProgress.forEach((up) => progressMap.set(up.topic_id, up));

  return subjects.map((subj) => {
    const topicList = subj.topics || [];
    const totalSubjectTopics = topicList.length;

    let completedCount = 0;
    let weakCount = 0;
    let scoresSum = 0;
    let scoresCount = 0;

    topicList.forEach((t) => {
      const p = progressMap.get(t.id);
      if (p) {
        if (p.status === 'COMPLETED') completedCount++;
        if (p.status === 'WEAK') weakCount++;
        if (p.best_score > 0) {
          scoresSum += p.best_score;
          scoresCount++;
        }
      }
    });

    const completionPercent = totalSubjectTopics > 0 ? Math.round((completedCount / totalSubjectTopics) * 100) : 0;
    const avgAccuracy = scoresCount > 0 ? Math.round(scoresSum / scoresCount) : 0;

    return {
      id: subj.id,
      code: subj.code,
      name: subj.name,
      description: subj.description,
      total_topics: totalSubjectTopics,
      completed_topics: completedCount,
      weak_topics: weakCount,
      completion_percent: completionPercent,
      average_accuracy: avgAccuracy,
    };
  });
}

module.exports = {
  getDashboardSummary,
  getSubjectProgress,
};
