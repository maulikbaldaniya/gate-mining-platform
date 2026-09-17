const db = require('../models');

async function get120DaySchedule(userId) {
  const days = await db.StudyDay.findAll({
    order: [['day_number', 'ASC']],
    include: [
      {
        model: db.DayTopic,
        as: 'dayTopics',
        include: [
          {
            model: db.Topic,
            as: 'topic',
            attributes: ['id', 'name', 'code', 'subject_id'],
          },
        ],
      },
      {
        model: db.DailyProgress,
        as: 'userProgress',
        where: { user_id: userId },
        required: false,
      },
    ],
  });

  // Also fetch all completed topics for this user to accurately compute topic-level badges
  const completedProgress = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      status: ['COMPLETED'],
    },
    attributes: ['topic_id'],
  });
  const completedTopicIds = new Set(completedProgress.map((cp) => cp.topic_id));

  return days.map((day) => {
    const totalTopics = day.dayTopics ? day.dayTopics.length : 0;
    const completedTopics = day.dayTopics
      ? day.dayTopics.filter((dt) => completedTopicIds.has(dt.topic_id)).length
      : 0;
    const isCompleted = totalTopics > 0 && completedTopics === totalTopics;

    return {
      id: day.id,
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      week_number: day.week_number,
      total_topics: totalTopics,
      completed_topics: completedTopics,
      is_completed: isCompleted,
      topics: (day.dayTopics || []).map((dt) => ({
        topic_id: dt.topic_id,
        name: dt.topic ? dt.topic.name : 'Topic',
        code: dt.topic ? dt.topic.code : null,
        sequence: dt.sequence,
        estimated_minutes: dt.estimated_minutes,
        is_completed: completedTopicIds.has(dt.topic_id),
      })),
    };
  });
}

async function getDayDetails(dayNumber, userId) {
  const day = await db.StudyDay.findOne({
    where: { day_number: dayNumber },
    include: [
      {
        model: db.DayTopic,
        as: 'dayTopics',
        include: [
          {
            model: db.Topic,
            as: 'topic',
            include: [
              {
                model: db.Subject,
                as: 'subject',
                attributes: ['id', 'name', 'code'],
              },
            ],
          },
        ],
      },
    ],
    order: [[{ model: db.DayTopic, as: 'dayTopics' }, 'sequence', 'ASC']],
  });

  if (!day) {
    const error = new Error(`Study Day ${dayNumber} not found`);
    error.statusCode = 404;
    error.errorCode = 'DAY_NOT_FOUND';
    throw error;
  }

  // Fetch topic progress for these topics
  const topicIds = day.dayTopics.map((dt) => dt.topic_id);
  const progressList = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      topic_id: topicIds,
    },
  });
  const progressMap = new Map();
  progressList.forEach((p) => progressMap.set(p.topic_id, p));

  const topicsWithProgress = day.dayTopics.map((dt) => {
    const prog = progressMap.get(dt.topic_id);
    return {
      id: dt.topic_id,
      name: dt.topic.name,
      code: dt.topic.code,
      subject: dt.topic.subject ? dt.topic.subject.name : 'Mining Engineering',
      subject_id: dt.topic.subject_id,
      sequence: dt.sequence,
      estimated_minutes: dt.estimated_minutes,
      is_required: dt.is_required,
      status: prog ? prog.status : 'NOT_STARTED',
      best_score: prog ? prog.best_score : 0,
      attempts_count: prog ? prog.attempts_count : 0,
    };
  });

  const completedCount = topicsWithProgress.filter((t) => t.status === 'COMPLETED').length;
  const isDayCompleted = topicsWithProgress.length > 0 && completedCount === topicsWithProgress.length;

  return {
    id: day.id,
    day_number: day.day_number,
    title: day.title,
    description: day.description,
    week_number: day.week_number,
    total_topics: topicsWithProgress.length,
    completed_topics: completedCount,
    is_completed: isDayCompleted,
    topics: topicsWithProgress,
  };
}

module.exports = {
  get120DaySchedule,
  getDayDetails,
};
