const db = require('../models');
const ApiResponse = require('../utils/apiResponse');

async function getPYQs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const offset = (page - 1) * limit;

    const where = { is_pyq: true };
    if (req.query.year) {
      where.pyq_year = parseInt(req.query.year, 10);
    }
    if (req.query.topicId) {
      where.topic_id = parseInt(req.query.topicId, 10);
    }
    if (req.query.difficulty) {
      where.difficulty = req.query.difficulty;
    }

    const { count, rows } = await db.Question.findAndCountAll({
      where,
      limit,
      offset,
      order: [['pyq_year', 'DESC'], ['id', 'ASC']],
      include: [
        {
          model: db.QuestionOption,
          as: 'options',
          attributes: ['id', 'option_key', 'option_text', 'is_correct'],
        },
        {
          model: db.Topic,
          as: 'topic',
          attributes: ['id', 'name', 'code', 'subject_id'],
          include: [
            {
              model: db.Subject,
              as: 'subject',
              attributes: ['id', 'name', 'code'],
            },
          ],
        },
      ],
    });

    const pagination = {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return ApiResponse.success(res, 'PYQs retrieved successfully', { pyqs: rows }, 200, pagination);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPYQs,
};
