const progressService = require('../services/progressService');
const ApiResponse = require('../utils/apiResponse');

async function getProgressOverview(req, res, next) {
  try {
    const summary = await progressService.getDashboardSummary(req.user.id);
    return ApiResponse.success(res, 'Progress overview retrieved', summary.overall);
  } catch (error) {
    next(error);
  }
}

async function getSubjectProgress(req, res, next) {
  try {
    const subjects = await progressService.getSubjectProgress(req.user.id);
    return ApiResponse.success(res, 'Subject progress breakdown retrieved', { subjects });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProgressOverview,
  getSubjectProgress,
};
