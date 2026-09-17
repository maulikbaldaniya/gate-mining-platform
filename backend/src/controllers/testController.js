const testService = require('../services/testService');
const ApiResponse = require('../utils/apiResponse');

async function getWeeklyTestStatus(req, res, next) {
  try {
    const weekNumber = parseInt(req.query.weekNumber, 10) || 1;
    const status = await testService.getWeeklyTestStatus(req.user.id, weekNumber);
    return ApiResponse.success(res, 'Weekly test status retrieved', status);
  } catch (error) {
    next(error);
  }
}

async function generateWeeklyTest(req, res, next) {
  try {
    const weekNumber = parseInt(req.body.weekNumber, 10) || 1;
    const test = await testService.generateWeeklyTest(req.user.id, weekNumber);
    return ApiResponse.success(res, 'Weekly test generated successfully', { test }, 201);
  } catch (error) {
    next(error);
  }
}

async function startWeeklyTest(req, res, next) {
  try {
    const testId = parseInt(req.params.testId, 10);
    const session = await testService.startWeeklyTest(req.user.id, testId);
    return ApiResponse.success(res, 'Weekly test started', { session });
  } catch (error) {
    next(error);
  }
}

async function submitWeeklyTest(req, res, next) {
  try {
    const testId = parseInt(req.params.testId, 10);
    const { answers } = req.body;
    const result = await testService.submitWeeklyTest(req.user.id, testId, answers);
    return ApiResponse.success(res, 'Weekly test submitted and evaluated', { result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWeeklyTestStatus,
  generateWeeklyTest,
  startWeeklyTest,
  submitWeeklyTest,
};
