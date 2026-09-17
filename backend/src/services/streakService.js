const db = require('../models');

async function updateUserStreak(userId) {
  const todayStr = new Date().toISOString().split('T')[0];
  let streak = await db.UserStreak.findOne({ where: { user_id: userId } });

  if (!streak) {
    streak = await db.UserStreak.create({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: todayStr,
      total_days_studied: 1,
      badges: ['Welcome Miner!'],
    });
    return streak;
  }

  const lastDate = new Date(streak.last_active_date);
  const today = new Date(todayStr);
  const diffTime = today - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day!
    streak.current_streak += 1;
    streak.total_days_studied += 1;
    if (streak.current_streak > streak.longest_streak) {
      streak.longest_streak = streak.current_streak;
    }
    streak.last_active_date = todayStr;
  } else if (diffDays > 1) {
    // Streak broken
    streak.current_streak = 1;
    streak.total_days_studied += 1;
    streak.last_active_date = todayStr;
  }

  // Check and award badges
  const currentBadges = Array.isArray(streak.badges) ? [...streak.badges] : [];
  if (streak.current_streak >= 7 && !currentBadges.includes('7-Day Consistency')) {
    currentBadges.push('7-Day Consistency');
  }
  if (streak.current_streak >= 30 && !currentBadges.includes('30-Day Master')) {
    currentBadges.push('30-Day Master');
  }

  streak.badges = currentBadges;
  await streak.save();
  return streak;
}

module.exports = {
  updateUserStreak,
};
