const progressService = require('../services/progressService');
const ApiResponse = require('../utils/apiResponse');

async function getDashboard(req, res, next) {
  try {
    const summary = await progressService.getDashboardSummary(req.user.id);
    return ApiResponse.success(res, 'Dashboard metrics fetched successfully', summary);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
};
