const { REVISION_INTERVALS_DAYS } = require('../constants/revisionCycles');

/**
 * Get week number based on study day number (1-120)
 * Days 1-7 -> Week 1, Days 8-14 -> Week 2, etc.
 */
function getWeekNumberForDay(dayNumber) {
  if (!dayNumber || dayNumber < 1) return 1;
  return Math.ceil(dayNumber / 7);
}

/**
 * Calculate scheduled date for a revision cycle (cycle 1 = +1 day, cycle 2 = +3 days, etc.)
 */
function calculateRevisionDate(cycleIndex = 0, baseDate = new Date()) {
  const daysToAdd = REVISION_INTERVALS_DAYS[cycleIndex] || 30;
  const target = new Date(baseDate);
  target.setDate(target.getDate() + daysToAdd);
  target.setHours(0, 0, 0, 0);
  return target;
}

/**
 * Formats date as YYYY-MM-DD
 */
function formatDateKey(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

module.exports = {
  getWeekNumberForDay,
  calculateRevisionDate,
  formatDateKey,
};
