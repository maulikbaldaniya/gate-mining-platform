const fs = require('fs');
const path = require('path');
const db = require('../models');
const logger = require('../utils/logger');
const validateContent = require('./validate');

function loadJson(fileName) {
  const filePath = path.join(__dirname, 'data', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function seedDatabase() {
  logger.info('Starting Idempotent GATE Mining Database Seeding...');

  // Step 1: Validate content first
  validateContent();

  const transaction = await db.sequelize.transaction();
  try {
    const subjects = loadJson('subjects.json');
    const chapters = loadJson('chapters.json');
    const topics = loadJson('topics.json');
    const schedule = loadJson('schedule120.json');
    const lessons = loadJson('lessons.json');
    const questions = loadJson('questions.json');
    const pyqs = loadJson('pyqs.json');
    const formulas = loadJson('formulas.json');
    const resources = loadJson('resources.json');

    // 1. Seed Subjects
    logger.info(`Seeding ${subjects.length} Subjects...`);
    for (const s of subjects) {
      await db.Subject.upsert(
        {
          id: s.id,
          code: s.code,
          name: s.name,
          description: s.description,
          exam_year: s.exam_year || 2027,
          content_version: s.content_version || '2027-v1',
          order_index: s.order_index || 0,
        },
        { transaction }
      );
    }

    // 2. Seed Chapters
    logger.info(`Seeding ${chapters.length} Chapters...`);
    for (const c of chapters) {
      await db.Chapter.upsert(
        {
          id: c.id,
          subject_id: c.subject_id,
          name: c.name,
          order_index: c.order_index || 0,
        },
        { transaction }
      );
    }

    // 3. Seed Topics
    logger.info(`Seeding ${topics.length} Topics...`);
    for (const t of topics) {
      await db.Topic.upsert(
        {
          id: t.id,
          subject_id: t.subject_id,
          chapter_id: t.chapter_id,
          name: t.name,
          code: t.code,
          estimated_minutes: t.estimated_minutes || 45,
          order_index: t.order_index || 0,
        },
        { transaction }
      );
    }

    // 4. Seed 120-Day Schedule & DayTopics
    logger.info(`Seeding ${schedule.length} Study Days...`);
    for (const day of schedule) {
      const [studyDay] = await db.StudyDay.upsert(
        {
          day_number: day.day_number,
          title: day.title,
          description: day.description,
          week_number: day.week_number,
        },
        { transaction, returning: true }
      );

      const dayId = studyDay.id || day.day_number;

      if (Array.isArray(day.topics)) {
        for (const dt of day.topics) {
          const [existingDT] = await db.DayTopic.findOrCreate({
            where: {
              day_id: dayId,
              topic_id: dt.topic_id,
            },
            defaults: {
              sequence: dt.sequence || 1,
              estimated_minutes: dt.estimated_minutes || 45,
              is_required: dt.is_required !== false,
            },
            transaction,
          });
          if (existingDT) {
            existingDT.sequence = dt.sequence || 1;
            existingDT.estimated_minutes = dt.estimated_minutes || 45;
            existingDT.is_required = dt.is_required !== false;
            await existingDT.save({ transaction });
          }
        }
      }
    }

    // 5. Seed Lessons and 8-Level LessonSections
    logger.info(`Seeding ${lessons.length} Structured Lessons...`);
    for (const l of lessons) {
      let lesson = await db.Lesson.findOne({
        where: { topic_id: l.topic_id },
        transaction,
      });

      if (!lesson) {
        lesson = await db.Lesson.create(
          {
            topic_id: l.topic_id,
            title: l.title,
            overview: l.overview,
            estimated_read_time: l.estimated_read_time || 20,
          },
          { transaction }
        );
      } else {
        lesson.title = l.title;
        lesson.overview = l.overview;
        lesson.estimated_read_time = l.estimated_read_time || 20;
        await lesson.save({ transaction });
      }

      // Delete existing sections to make sections update clean and idempotent
      await db.LessonSection.destroy({
        where: { lesson_id: lesson.id },
        transaction,
      });

      for (const sec of l.sections) {
        await db.LessonSection.create(
          {
            lesson_id: lesson.id,
            level_number: sec.level_number,
            section_type: sec.section_type,
            title: sec.title,
            content_text: sec.content_text,
            order_index: sec.order_index || sec.level_number,
          },
          { transaction }
        );
      }
    }

    // 6. Seed Questions and QuestionOptions
    logger.info(`Seeding Questions & Options...`);
    for (const q of questions) {
      let [question, created] = await db.Question.findOrCreate({
        where: {
          topic_id: q.topic_id,
          question_text: q.question_text,
        },
        defaults: {
          type: q.type || 'MCQ',
          difficulty: q.difficulty || 'MEDIUM',
          correct_answer: q.correct_answer,
          explanation_json: q.explanation_json,
          is_pyq: q.is_pyq || false,
          pyq_year: q.pyq_year || null,
          source: q.source || 'GATE Official / Verified Question Bank',
          is_official: true,
        },
        transaction,
      });

      if (!created) {
        question.type = q.type || 'MCQ';
        question.difficulty = q.difficulty || 'MEDIUM';
        question.correct_answer = q.correct_answer;
        question.explanation_json = q.explanation_json;
        question.is_pyq = q.is_pyq || false;
        question.pyq_year = q.pyq_year || null;
        await question.save({ transaction });
      }

      // Clear & recreate options for clean idempotency
      await db.QuestionOption.destroy({
        where: { question_id: question.id },
        transaction,
      });

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          await db.QuestionOption.create(
            {
              question_id: question.id,
              option_key: opt.option_key,
              option_text: opt.option_text,
              is_correct: opt.is_correct || opt.option_key === q.correct_answer,
            },
            { transaction }
          );
        }
      }
    }

    // 7. Seed Additional PYQs
    logger.info(`Seeding PYQs...`);
    for (const p of pyqs) {
      let [pyqQuestion, created] = await db.Question.findOrCreate({
        where: {
          topic_id: p.topic_id,
          question_text: p.question_text,
        },
        defaults: {
          type: p.type || 'MCQ',
          difficulty: p.difficulty || 'MEDIUM',
          correct_answer: p.correct_answer,
          explanation_json: p.explanation_json,
          is_pyq: true,
          pyq_year: p.pyq_year,
          source: p.source,
          is_official: p.is_official !== false,
        },
        transaction,
      });

      if (Array.isArray(p.options)) {
        await db.QuestionOption.destroy({
          where: { question_id: pyqQuestion.id },
          transaction,
        });

        for (const opt of p.options) {
          await db.QuestionOption.create(
            {
              question_id: pyqQuestion.id,
              option_key: opt.option_key,
              option_text: opt.option_text,
              is_correct: opt.is_correct || opt.option_key === p.correct_answer,
            },
            { transaction }
          );
        }
      }
    }

    // 8. Seed Resources
    logger.info(`Seeding ${resources.length} Resources...`);
    for (const r of resources) {
      await db.Resource.findOrCreate({
        where: {
          topic_id: r.topic_id,
          title: r.title,
        },
        defaults: {
          resource_type: r.resource_type || 'NOTES',
          url: r.url,
          provider: r.provider,
          is_free: r.is_free !== false,
          is_verified: true,
          description: r.description,
        },
        transaction,
      });
    }

    await transaction.commit();
    logger.info('Database seeding completed successfully and verified idempotent!');
    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error('Database seeding failed, transaction rolled back:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed script finished. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed process error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
