const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed data file missing: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateContent() {
  logger.info('Running comprehensive GATE MN Content Validation...');
  const errors = [];
  const warnings = [];

  const subjects = loadJson('subjects.json');
  const chapters = loadJson('chapters.json');
  const topics = loadJson('topics.json');
  const schedule = loadJson('schedule120.json');
  const lessons = loadJson('lessons.json');
  const questions = loadJson('questions.json');
  const pyqs = loadJson('pyqs.json');
  const formulas = loadJson('formulas.json');
  const resources = loadJson('resources.json');

  const subjectIds = new Set(subjects.map((s) => s.id));
  const chapterIds = new Set(chapters.map((c) => c.id));
  const topicIds = new Set(topics.map((t) => t.id));

  // 1. Validate Subjects
  const subjectCodes = new Set();
  subjects.forEach((s) => {
    if (!s.id || !s.code || !s.name) {
      errors.push(`Subject missing id, code, or name: ${JSON.stringify(s)}`);
    }
    if (subjectCodes.has(s.code)) {
      errors.push(`Duplicate subject code: ${s.code}`);
    }
    subjectCodes.add(s.code);
  });

  // 2. Validate Chapters
  const seenChapterIds = new Set();
  chapters.forEach((c) => {
    if (seenChapterIds.has(c.id)) {
      errors.push(`Duplicate chapter ID: ${c.id}`);
    }
    seenChapterIds.add(c.id);
    if (!subjectIds.has(c.subject_id)) {
      errors.push(`Chapter ${c.id} (${c.name}) references non-existent subject_id: ${c.subject_id}`);
    }
  });

  // 3. Validate Topics
  const seenTopicIds = new Set();
  topics.forEach((t) => {
    if (seenTopicIds.has(t.id)) {
      errors.push(`Duplicate topic ID: ${t.id}`);
    }
    seenTopicIds.add(t.id);
    if (!chapterIds.has(t.chapter_id)) {
      errors.push(`Topic ${t.id} (${t.name}) references non-existent chapter_id: ${t.chapter_id}`);
    }
    if (!subjectIds.has(t.subject_id)) {
      errors.push(`Topic ${t.id} (${t.name}) references non-existent subject_id: ${t.subject_id}`);
    }
  });

  // 4. Validate 120-Day Schedule
  const seenDays = new Set();
  schedule.forEach((day) => {
    if (seenDays.has(day.day_number)) {
      errors.push(`Duplicate day number in schedule: Day ${day.day_number}`);
    }
    seenDays.add(day.day_number);

    if (day.day_number < 1 || day.day_number > 120) {
      errors.push(`Invalid day number: ${day.day_number}. Must be between 1 and 120.`);
    }

    if (!Array.isArray(day.topics) || day.topics.length === 0) {
      warnings.push(`Day ${day.day_number} has no topics assigned.`);
    } else {
      day.topics.forEach((dt) => {
        if (!topicIds.has(dt.topic_id)) {
          errors.push(`Day ${day.day_number} assigned non-existent topic_id: ${dt.topic_id}`);
        }
      });
    }
  });

  // 5. Validate Lessons
  const seenLessonTopicIds = new Set();
  lessons.forEach((l) => {
    if (seenLessonTopicIds.has(l.topic_id)) {
      errors.push(`Duplicate lesson for topic_id: ${l.topic_id}`);
    }
    seenLessonTopicIds.add(l.topic_id);
    if (!topicIds.has(l.topic_id)) {
      errors.push(`Lesson references non-existent topic_id: ${l.topic_id}`);
    }
    if (!Array.isArray(l.sections) || l.sections.length === 0) {
      errors.push(`Lesson for topic_id ${l.topic_id} has no sections!`);
    } else {
      l.sections.forEach((sec) => {
        if (!sec.level_number || !sec.content_text) {
          errors.push(`Lesson section missing level_number or content_text in topic_id ${l.topic_id}`);
        }
      });
    }
  });

  // 6. Validate Questions
  const questionTexts = new Set();
  questions.forEach((q, idx) => {
    if (!topicIds.has(q.topic_id)) {
      errors.push(`Question ${idx + 1} references non-existent topic_id: ${q.topic_id}`);
    }
    if (!q.question_text || !q.correct_answer) {
      errors.push(`Question ${idx + 1} missing question_text or correct_answer`);
    }
    if (questionTexts.has(q.question_text)) {
      warnings.push(`Duplicate question text detected: "${q.question_text.slice(0, 40)}..."`);
    }
    questionTexts.add(q.question_text);

    if (q.type === 'MCQ') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question ${idx + 1} has insufficient options`);
      } else {
        const optionKeys = q.options.map((o) => o.option_key);
        if (!optionKeys.includes(q.correct_answer)) {
          errors.push(`Question ${idx + 1} correct_answer '${q.correct_answer}' not found in options: [${optionKeys.join(', ')}]`);
        }
      }
    }

    if (!q.explanation_json || !q.explanation_json.why_correct) {
      warnings.push(`Question ${idx + 1} missing explanation_json.why_correct`);
    }
  });

  // 7. Validate PYQs
  pyqs.forEach((p, idx) => {
    if (!topicIds.has(p.topic_id)) {
      errors.push(`PYQ ${idx + 1} references non-existent topic_id: ${p.topic_id}`);
    }
    if (!p.pyq_year || p.pyq_year < 1990 || p.pyq_year > 2026) {
      errors.push(`PYQ ${idx + 1} has invalid or missing pyq_year: ${p.pyq_year}`);
    }
  });

  // 8. Validate Formulas
  formulas.forEach((f, idx) => {
    if (!topicIds.has(f.topic_id)) {
      errors.push(`Formula ${idx + 1} (${f.title}) references non-existent topic_id: ${f.topic_id}`);
    }
    if (!f.formula_latex) {
      errors.push(`Formula ${idx + 1} missing formula_latex`);
    }
  });

  // 9. Validate Resources
  resources.forEach((r, idx) => {
    if (!topicIds.has(r.topic_id)) {
      errors.push(`Resource ${idx + 1} (${r.title}) references non-existent topic_id: ${r.topic_id}`);
    }
    if (!r.url || !r.url.startsWith('http')) {
      errors.push(`Resource ${idx + 1} has invalid URL: ${r.url}`);
    }
  });

  logger.info(`Validation Summary: ${subjects.length} subjects, ${chapters.length} chapters, ${topics.length} topics, ${schedule.length} study days.`);
  logger.info(`Found ${errors.length} errors, ${warnings.length} warnings.`);

  if (warnings.length > 0) {
    logger.warn('Content Warnings:', warnings);
  }

  if (errors.length > 0) {
    logger.error('Content Validation FAILED with errors:', errors);
    throw new Error(`Content validation failed with ${errors.length} errors.`);
  }

  logger.info('All content verified and passed validation successfully!');
  return true;
}

if (require.main === module) {
  try {
    validateContent();
    process.exit(0);
  } catch (err) {
    logger.error('Validation script encountered error:', err.message);
    process.exit(1);
  }
}

module.exports = validateContent;
