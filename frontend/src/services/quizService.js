import api from './api';

export const quizService = {
  async getTopicQuiz(topicId) {
    const res = await api.get(`/quiz/topic/${topicId}`);
    return res.data.data.questions;
  },

  async submitQuiz(topicId, answers, durationSeconds) {
    const res = await api.post('/quiz/submit', {
      topicId,
      answers,
      durationSeconds,
    });
    return res.data.data.result;
  },
};
