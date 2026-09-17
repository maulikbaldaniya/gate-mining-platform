const revisionService = require('../services/revisionService');
const ApiResponse = require('../utils/apiResponse');

async function getTodayRevisions(req, res, next) {
  try {
    const revisions = await revisionService.getTodayRevisions(req.user.id);
    return ApiResponse.success(res, "Today's revisions retrieved", { revisions });
  } catch (error) {
    next(error);
  }
}

async function completeRevision(req, res, next) {
  try {
    const revisionId = parseInt(req.params.revisionId, 10);
    const result = await revisionService.completeRevision(req.user.id, revisionId);
    return ApiResponse.success(res, 'Revision completed successfully', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodayRevisions,
  completeRevision,
};
