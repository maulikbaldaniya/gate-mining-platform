const db = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { Op } = require('sequelize');

async function searchAll(req, res, next) {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return ApiResponse.success(res, 'Search query empty', { results: [] });
    }

    const searchPattern = `%${query}%`;

    // 1. Search Subjects
    const subjects = await db.Subject.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchPattern } },
          { description: { [Op.like]: searchPattern } },
        ],
      },
      limit: 5,
    });

    // 2. Search Topics
    const topics = await db.Topic.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchPattern } },
          { code: { [Op.like]: searchPattern } },
        ],
      },
      include: [{ model: db.Subject, as: 'subject', attributes: ['name'] }],
      limit: 10,
    });

    // 3. Search Questions & PYQs
    const questions = await db.Question.findAll({
      where: {
        question_text: { [Op.like]: searchPattern },
      },
      limit: 10,
    });

    return ApiResponse.success(res, 'Search results fetched', {
      query,
      subjects: subjects.map((s) => ({ id: s.id, type: 'SUBJECT', title: s.name, description: s.description })),
      topics: topics.map((t) => ({
        id: t.id,
        type: 'TOPIC',
        title: t.name,
        subject: t.subject ? t.subject.name : 'Mining',
      })),
      questions: questions.map((q) => ({
        id: q.id,
        topic_id: q.topic_id,
        type: q.is_pyq ? 'PYQ' : 'QUESTION',
        title: q.question_text.slice(0, 100) + '...',
        difficulty: q.difficulty,
        pyq_year: q.pyq_year,
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchAll,
};
