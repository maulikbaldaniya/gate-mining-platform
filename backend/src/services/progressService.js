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

  // 8. Backlog Calculation for Days < currentDayNumber
  let backlogTopics = [];
  if (currentDayNumber > 1) {
    const previousDays = await db.StudyDay.findAll({
      where: { day_number: { [Op.lt]: currentDayNumber } },
      order: [['day_number', 'ASC']],
      include: [
        {
          model: db.DayTopic,
          as: 'dayTopics',
          include: [{ model: db.Topic, as: 'topic', attributes: ['id', 'name', 'code', 'subject_id'] }],
        },
      ],
    });

    const prevTopicIds = [];
    previousDays.forEach((pd) => {
      (pd.dayTopics || []).forEach((dt) => {
        if (dt.topic_id) prevTopicIds.push(dt.topic_id);
      });
    });

    if (prevTopicIds.length > 0) {
      const prevProgressList = await db.TopicProgress.findAll({
        where: { user_id: userId, topic_id: prevTopicIds },
      });
      const prevProgMap = new Map();
      prevProgressList.forEach((p) => prevProgMap.set(p.topic_id, p.status));

      previousDays.forEach((pd) => {
        (pd.dayTopics || []).forEach((dt) => {
          const status = prevProgMap.get(dt.topic_id) || 'NOT_STARTED';
          if (status !== 'COMPLETED' && dt.topic) {
            backlogTopics.push({
              day_number: pd.day_number,
              day_title: pd.title,
              topic_id: dt.topic_id,
              name: dt.topic.name,
              code: dt.topic.code,
              sequence: dt.sequence,
              estimated_minutes: dt.estimated_minutes,
              status,
            });
          }
        });
      });
    }
  }

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
    backlog: backlogTopics,
    backlog_count: backlogTopics.length,
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

async function getComprehensiveAnalytics(userId) {
  const summary = await getDashboardSummary(userId);
  const subjects = await getSubjectProgress(userId);

  // 1. Topic Status Distribution
  const allTopicProgress = await db.TopicProgress.findAll({
    where: { user_id: userId },
    include: [{ model: db.Topic, as: 'topic', attributes: ['id', 'name', 'estimated_minutes'] }],
  });

  let totalMinutesStudied = 0;
  let learningCount = 0;
  let completedCount = 0;
  let weakCount = 0;

  allTopicProgress.forEach((tp) => {
    if (tp.status === 'COMPLETED') {
      completedCount++;
      totalMinutesStudied += (tp.topic?.estimated_minutes || 45);
    } else if (tp.status === 'WEAK') {
      weakCount++;
      totalMinutesStudied += 20;
    } else if (tp.status === 'LEARNING') {
      learningCount++;
      totalMinutesStudied += 15;
    }
  });

  const totalTopics = await db.Topic.count();
  const unstartedCount = Math.max(0, totalTopics - completedCount - learningCount - weakCount);

  // 2. Question Attempts Analytics
  const attempts = await db.QuestionAttempt.findAll({
    where: { user_id: userId },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const wrongAttempts = attempts.filter((a) => !a.is_correct && a.user_answer).length;
  const skippedAttempts = attempts.filter((a) => !a.user_answer).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // 3. Mistake Book Breakdown
  const mistakes = await db.Mistake.findAll({
    where: { user_id: userId },
    attributes: ['category', 'is_resolved'],
  });

  const mistakeCategories = {
    M1: 0,
    M2: 0,
    M3: 0,
    M4: 0,
    M5: 0,
    M6: 0,
  };
  let unresolvedMistakes = 0;
  mistakes.forEach((m) => {
    if (mistakeCategories[m.category] !== undefined) {
      mistakeCategories[m.category]++;
    }
    if (!m.is_resolved) unresolvedMistakes++;
  });

  // 4. Exam Readiness Index (0 - 100)
  const syllabusPct = summary.overall.syllabus_percent || 0;
  const accScore = summary.overall.average_accuracy || 0;
  const streakBonus = Math.min(20, (summary.overall.streak?.current || 1) * 2);
  const examReadinessScore = Math.min(100, Math.round((syllabusPct * 0.5) + (accScore * 0.3) + streakBonus));

  let readinessLevel = 'Early Foundation (તૈયારીની શરૂઆત)';
  let projectedRank = 'Target: AIR Under 500';
  if (examReadinessScore >= 75) {
    readinessLevel = 'Rank Contender (ટોપ રેન્કર લેવલ)';
    projectedRank = 'Projected: Top 50 AIR';
  } else if (examReadinessScore >= 50) {
    readinessLevel = 'Solid Momentum (મજબૂત પકડ)';
    projectedRank = 'Projected: Top 150 AIR';
  } else if (examReadinessScore >= 25) {
    readinessLevel = 'Progressing Steadily (સતત પ્રગતિ)';
    projectedRank = 'Projected: Top 300 AIR';
  }

  // 5. Recent Activity List
  const recentAttempts = attempts.slice(0, 8).map((a) => ({
    id: a.id,
    is_correct: a.is_correct,
    time_spent: a.time_spent_seconds,
    type: a.attempt_type,
    date: a.createdAt,
  }));

  return {
    overview: {
      syllabus_percent: syllabusPct,
      completed_topics: completedCount,
      learning_topics: learningCount,
      weak_topics: weakCount,
      unstarted_topics: unstartedCount,
      total_topics: totalTopics,
      study_hours: (totalMinutesStudied / 60).toFixed(1),
      study_minutes: totalMinutesStudied,
      mcqs_solved: totalAttempts,
      average_accuracy: accScore,
      exam_readiness_score: examReadinessScore,
      readiness_level: readinessLevel,
      projected_rank: projectedRank,
      streak: summary.overall.streak,
    },
    backlog: {
      count: summary.backlog ? summary.backlog.length : 0,
      topics: summary.backlog || [],
      current_day: summary.user.current_day,
      velocity_status: (!summary.backlog || summary.backlog.length === 0) ? 'ON_TRACK' : 'BEHIND_SCHEDULE',
    },
    question_stats: {
      total: totalAttempts,
      correct: correctAttempts,
      wrong: wrongAttempts,
      skipped: skippedAttempts,
      accuracy,
    },
    mistake_breakdown: {
      total: mistakes.length,
      unresolved: unresolvedMistakes,
      categories: mistakeCategories,
    },
    recent_activity: recentAttempts,
    subjects,
  };
}

module.exports = {
  getDashboardSummary,
  getSubjectProgress,
  getComprehensiveAnalytics,
};
