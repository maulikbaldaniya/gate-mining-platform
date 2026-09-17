const topicService = require('../services/topicService');
const ApiResponse = require('../utils/apiResponse');

async function getTopic(req, res, next) {
  try {
    const topicId = parseInt(req.params.topicId, 10);
    const topic = await topicService.getTopicDetails(topicId, req.user.id);
    return ApiResponse.success(res, 'Topic fetched', { topic });
  } catch (error) {
    next(error);
  }
}

async function getLesson(req, res, next) {
  try {
    const topicId = parseInt(req.params.topicId, 10);
    const lesson = await topicService.getTopicLesson(topicId, req.user.id);
    return ApiResponse.success(res, 'Lesson fetched', { lesson });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopic,
  getLesson,
};
