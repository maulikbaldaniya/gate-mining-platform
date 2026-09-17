const db = require('../models');
const ApiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

async function getFormulas(req, res, next) {
  try {
    const { topicId, subjectId, search } = req.query;

    // First load pre-seeded master formulas from JSON
    const formulasFilePath = path.join(__dirname, '../seed/data/formulas.json');
    let masterFormulas = [];
    if (fs.existsSync(formulasFilePath)) {
      masterFormulas = JSON.parse(fs.readFileSync(formulasFilePath, 'utf8'));
    }

    // Also load user's bookmarked / custom formulas from DB
    const userFormulas = await db.FormulaBook.findAll({
      where: { user_id: req.user.id },
    });
    const bookmarkedTitles = new Set(userFormulas.filter((uf) => uf.is_bookmarked).map((uf) => uf.title));

    // Combine master formulas with user bookmarks
    let allFormulas = masterFormulas.map((mf, idx) => ({
      id: idx + 1,
      title: mf.title,
      formula_latex: mf.formula_latex,
      topic_id: mf.topic_id,
      subject_id: mf.subject_id,
      variable_meanings: mf.variable_meanings,
      units: mf.units,
      when_to_use: mf.when_to_use,
      common_traps: mf.common_traps,
      example_problem: mf.example_problem,
      is_bookmarked: bookmarkedTitles.has(mf.title),
    }));

    if (topicId) {
      allFormulas = allFormulas.filter((f) => f.topic_id === parseInt(topicId, 10));
    }
    if (subjectId) {
      allFormulas = allFormulas.filter((f) => f.subject_id === parseInt(subjectId, 10));
    }
    if (search) {
      const q = search.toLowerCase();
      allFormulas = allFormulas.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.formula_latex.toLowerCase().includes(q) ||
          (f.variable_meanings && f.variable_meanings.toLowerCase().includes(q))
      );
    }

    return ApiResponse.success(res, 'Formulas retrieved successfully', { formulas: allFormulas });
  } catch (error) {
    next(error);
  }
}

async function toggleBookmark(req, res, next) {
  try {
    const { title, formula_latex, topic_id, subject_id, variable_meanings, units, when_to_use, common_traps, example_problem } = req.body;

    let formula = await db.FormulaBook.findOne({
      where: { user_id: req.user.id, title },
    });

    if (formula) {
      formula.is_bookmarked = !formula.is_bookmarked;
      await formula.save();
    } else {
      formula = await db.FormulaBook.create({
        user_id: req.user.id,
        topic_id: topic_id || 1,
        subject_id: subject_id || 1,
        title,
        formula_latex,
        variable_meanings,
        units,
        when_to_use,
        common_traps,
        example_problem,
        is_bookmarked: true,
      });
    }

    return ApiResponse.success(res, 'Formula bookmark updated', { formula });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFormulas,
  toggleBookmark,
};
