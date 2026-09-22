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

  // Also fetch user to know current_day
  const user = await db.User.findByPk(userId, { attributes: ['current_day'] });
  const userCurrentDay = user?.current_day || 1;

  return days.map((day) => {
    const totalTopics = day.dayTopics ? day.dayTopics.length : 0;
    const completedTopics = day.dayTopics
      ? day.dayTopics.filter((dt) => completedTopicIds.has(dt.topic_id)).length
      : 0;
    const isCompleted = totalTopics > 0 && completedTopics === totalTopics;
    const isOverdue = day.day_number < userCurrentDay && !isCompleted;
    const isCurrent = day.day_number === userCurrentDay;

    return {
      id: day.id,
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      week_number: day.week_number,
      total_topics: totalTopics,
      completed_topics: completedTopics,
      is_completed: isCompleted,
      is_overdue: isOverdue,
      is_current: isCurrent,
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

  // Check backlog: If dayNumber > 1, find incomplete topics from days 1 to dayNumber - 1
  let backlogTopics = [];
  if (dayNumber > 1) {
    const previousDays = await db.StudyDay.findAll({
      where: {
        day_number: { [db.Sequelize.Op.lt]: dayNumber },
      },
      order: [['day_number', 'ASC']],
      include: [
        {
          model: db.DayTopic,
          as: 'dayTopics',
          include: [
            {
              model: db.Topic,
              as: 'topic',
              include: [{ model: db.Subject, as: 'subject', attributes: ['id', 'name', 'code'] }],
            },
          ],
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
        where: {
          user_id: userId,
          topic_id: prevTopicIds,
        },
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
              subject: dt.topic.subject ? dt.topic.subject.name : 'Mining Engineering',
              estimated_minutes: dt.estimated_minutes,
              status,
            });
          }
        });
      });
    }
  }

  // Get user current day
  const user = await db.User.findByPk(userId, { attributes: ['current_day'] });

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
    backlog: backlogTopics,
    backlog_count: backlogTopics.length,
    user_current_day: user?.current_day || 1,
  };
}

async function setCurrentDay(userId, dayNumber) {
  const user = await db.User.findByPk(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const parsedDay = parseInt(dayNumber, 10);
  if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 120) {
    const error = new Error('Invalid day number. Must be between 1 and 120');
    error.statusCode = 400;
    throw error;
  }
  user.current_day = parsedDay;
  await user.save();
  return { current_day: user.current_day };
}

async function getBacklog(userId, targetDayNumber) {
  const user = await db.User.findByPk(userId, { attributes: ['current_day'] });
  const activeDay = targetDayNumber ? parseInt(targetDayNumber, 10) : (user?.current_day || 1);

  if (activeDay <= 1) {
    return {
      current_day: activeDay,
      total_backlog_topics: 0,
      backlog_topics: [],
    };
  }

  const previousDays = await db.StudyDay.findAll({
    where: {
      day_number: { [db.Sequelize.Op.lt]: activeDay },
    },
    order: [['day_number', 'ASC']],
    include: [
      {
        model: db.DayTopic,
        as: 'dayTopics',
        include: [
          {
            model: db.Topic,
            as: 'topic',
            include: [{ model: db.Subject, as: 'subject', attributes: ['id', 'name', 'code'] }],
          },
        ],
      },
    ],
  });

  const prevTopicIds = [];
  previousDays.forEach((pd) => {
    (pd.dayTopics || []).forEach((dt) => {
      if (dt.topic_id) prevTopicIds.push(dt.topic_id);
    });
  });

  const prevProgressList = await db.TopicProgress.findAll({
    where: {
      user_id: userId,
      topic_id: prevTopicIds,
    },
  });
  const prevProgMap = new Map();
  prevProgressList.forEach((p) => prevProgMap.set(p.topic_id, p.status));

  const backlogTopics = [];
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
          subject: dt.topic.subject ? dt.topic.subject.name : 'Mining Engineering',
          estimated_minutes: dt.estimated_minutes,
          status,
        });
      }
    });
  });

  return {
    current_day: activeDay,
    total_backlog_topics: backlogTopics.length,
    backlog_topics: backlogTopics,
  };
}

module.exports = {
  get120DaySchedule,
  getDayDetails,
  setCurrentDay,
  getBacklog,
};
