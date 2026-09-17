const { Op } = require('sequelize');
const db = require('../models');
const { calculateRevisionDate, formatDateKey } = require('../utils/dateUtils');
const { REVISION_INTERVALS_DAYS } = require('../constants/revisionCycles');

async function getTodayRevisions(userId) {
  const todayStr = formatDateKey(new Date());

  const schedules = await db.RevisionSchedule.findAll({
    where: {
      user_id: userId,
      is_completed: false,
      scheduled_date: {
        [Op.lte]: todayStr,
      },
    },
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
    order: [['scheduled_date', 'ASC']],
  });

  return schedules.map((s) => ({
    id: s.id,
    topic_id: s.topic_id,
    topic_name: s.topic ? s.topic.name : 'Mining Topic',
    subject_name: s.topic && s.topic.subject ? s.topic.subject.name : 'Mining',
    revision_cycle: s.revision_cycle,
    interval_days: REVISION_INTERVALS_DAYS[s.revision_cycle - 1] || 30,
    scheduled_date: s.scheduled_date,
  }));
}

async function completeRevision(userId, revisionScheduleId) {
  const schedule = await db.RevisionSchedule.findOne({
    where: { id: revisionScheduleId, user_id: userId },
  });

  if (!schedule) {
    const error = new Error('Revision item not found');
    error.statusCode = 404;
    throw error;
  }

  schedule.is_completed = true;
  schedule.completed_at = new Date();
  await schedule.save();

  // If there is a next cycle in [1, 3, 7, 15, 30], schedule the next cycle
  const currentCycle = schedule.revision_cycle;
  if (currentCycle < REVISION_INTERVALS_DAYS.length) {
    const nextCycle = currentCycle + 1;
    const nextDate = calculateRevisionDate(nextCycle - 1, new Date());

    await db.RevisionSchedule.create({
      user_id: userId,
      topic_id: schedule.topic_id,
      revision_cycle: nextCycle,
      scheduled_date: nextDate,
      is_completed: false,
    });
  }

  return { success: true, message: 'Revision marked complete, next cycle scheduled.' };
}

module.exports = {
  getTodayRevisions,
  completeRevision,
};
