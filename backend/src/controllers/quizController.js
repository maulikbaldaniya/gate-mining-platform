const quizService = require('../services/quizService');
const ApiResponse = require('../utils/apiResponse');

async function getTopicQuiz(req, res, next) {
  try {
    const topicId = parseInt(req.params.topicId, 10);
    const questions = await quizService.getTopicQuiz(topicId, req.user.id);
    return ApiResponse.success(res, '10-MCQ topic quiz loaded', { questions });
  } catch (error) {
    next(error);
  }
}

async function submitTopicQuiz(req, res, next) {
  try {
    const { topicId, answers, durationSeconds } = req.body;
    const result = await quizService.submitTopicQuiz(req.user.id, topicId, answers, durationSeconds);
    return ApiResponse.success(res, 'Quiz submitted and evaluated successfully', { result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopicQuiz,
  submitTopicQuiz,
};
