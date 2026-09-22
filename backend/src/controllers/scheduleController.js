const scheduleService = require('../services/scheduleService');
const ApiResponse = require('../utils/apiResponse');

async function getSchedule(req, res, next) {
  try {
    const schedule = await scheduleService.get120DaySchedule(req.user.id);
    return ApiResponse.success(res, '120-Day schedule fetched', { schedule });
  } catch (error) {
    next(error);
  }
}

async function getDayDetails(req, res, next) {
  try {
    const dayNumber = parseInt(req.params.dayNumber, 10);
    const day = await scheduleService.getDayDetails(dayNumber, req.user.id);
    return ApiResponse.success(res, `Day ${dayNumber} details fetched`, { day });
  } catch (error) {
    next(error);
  }
}

async function setCurrentDay(req, res, next) {
  try {
    const { dayNumber } = req.body;
    const result = await scheduleService.setCurrentDay(req.user.id, dayNumber);
    return ApiResponse.success(res, `Current study day set to Day ${result.current_day}`, result);
  } catch (error) {
    next(error);
  }
}

async function getBacklog(req, res, next) {
  try {
    const dayNumber = req.query.dayNumber ? parseInt(req.query.dayNumber, 10) : null;
    const backlog = await scheduleService.getBacklog(req.user.id, dayNumber);
    return ApiResponse.success(res, 'Backlog topics retrieved', backlog);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSchedule,
  getDayDetails,
  setCurrentDay,
  getBacklog,
};
