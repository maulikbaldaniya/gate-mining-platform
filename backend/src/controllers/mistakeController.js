const db = require('../models');
const ApiResponse = require('../utils/apiResponse');

async function getMistakes(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (req.query.category) {
      where.category = req.query.category;
    }
    if (req.query.is_resolved !== undefined) {
      where.is_resolved = req.query.is_resolved === 'true';
    }

    const { count, rows } = await db.Mistake.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.Question,
          as: 'question',
          attributes: ['id', 'question_text', 'type', 'difficulty', 'explanation_json'],
          include: [
            {
              model: db.QuestionOption,
              as: 'options',
              attributes: ['option_key', 'option_text'],
            },
          ],
        },
        {
          model: db.Topic,
          as: 'topic',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    const pagination = {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return ApiResponse.success(res, 'Mistakes retrieved successfully', { mistakes: rows }, 200, pagination);
  } catch (error) {
    next(error);
  }
}

async function updateMistake(req, res, next) {
  try {
    const mistakeId = parseInt(req.params.mistakeId, 10);
    const { category, user_notes, is_resolved } = req.body;

    const mistake = await db.Mistake.findOne({
      where: { id: mistakeId, user_id: req.user.id },
    });

    if (!mistake) {
      const error = new Error('Mistake record not found');
      error.statusCode = 404;
      throw error;
    }

    if (category) mistake.category = category;
    if (user_notes !== undefined) mistake.user_notes = user_notes;
    if (is_resolved !== undefined) {
      mistake.is_resolved = is_resolved;
      mistake.resolved_at = is_resolved ? new Date() : null;
    }

    await mistake.save();
    return ApiResponse.success(res, 'Mistake updated successfully', { mistake });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMistakes,
  updateMistake,
};
