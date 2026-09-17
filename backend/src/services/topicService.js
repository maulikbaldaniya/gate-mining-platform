const db = require('../models');
const { TOPIC_STATUS } = require('../constants/topicStatus');

async function getTopicDetails(topicId, userId) {
  const topic = await db.Topic.findByPk(topicId, {
    include: [
      {
        model: db.Subject,
        as: 'subject',
        attributes: ['id', 'name', 'code'],
      },
      {
        model: db.Chapter,
        as: 'chapter',
        attributes: ['id', 'name'],
      },
      {
        model: db.Subtopic,
        as: 'subtopics',
        attributes: ['id', 'name'],
      },
      {
        model: db.Resource,
        as: 'resources',
      },
      {
        model: db.Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'overview', 'estimated_read_time'],
      },
    ],
  });

  if (!topic) {
    const error = new Error(`Topic with ID ${topicId} not found`);
    error.statusCode = 404;
    error.errorCode = 'TOPIC_NOT_FOUND';
    throw error;
  }

  // Fetch or initialize user progress
  let [progress] = await db.TopicProgress.findOrCreate({
    where: { user_id: userId, topic_id: topicId },
    defaults: {
      status: TOPIC_STATUS.NOT_STARTED,
      best_score: 0,
      attempts_count: 0,
    },
  });

  // Count available MCQs and PYQs
  const totalQuestions = await db.Question.count({ where: { topic_id: topicId } });
  const pyqCount = await db.Question.count({ where: { topic_id: topicId, is_pyq: true } });

  return {
    ...topic.toJSON(),
    progress: progress.toJSON(),
    stats: {
      total_mcqs: totalQuestions,
      pyqs_available: pyqCount,
    },
  };
}

async function getTopicLesson(topicId, userId) {
  let lesson = await db.Lesson.findOne({
    where: { topic_id: topicId },
    include: [
      {
        model: db.LessonSection,
        as: 'sections',
        order: [['level_number', 'ASC']],
      },
    ],
  });

  if (!lesson) {
    // Generate standard 8-level structured placeholder for unseeded topics
    const topic = await db.Topic.findByPk(topicId, {
      include: [{ model: db.Subject, as: 'subject' }],
    });
    if (!topic) {
      const error = new Error('Topic not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      topic_id: topic.id,
      title: `${topic.name} Mastery Guide`,
      overview: `Detailed syllabus-aligned study modules for ${topic.name} under ${topic.subject ? topic.subject.name : 'Mining'}.`,
      estimated_read_time: 25,
      sections: [
        {
          level_number: 1,
          section_type: 'CONCEPT_INTRO',
          title: 'Level 1: What is this topic? (Ye Topic Kya Hai?)',
          content_text: `${topic.name} GATE Mining Engineering syllabus ka important topic hai. Is section me hum iske core theoretical principles, field applications, aur definitions ko Hinglish me samjhenge.`,
        },
        {
          level_number: 2,
          section_type: 'IMPORTANCE',
          title: 'Level 2: Why does it matter? (GATE aur Mining me iska kya role hai?)',
          content_text: `Ye topic mine operations, safety standards, aur GATE exam scoring ke liye directly crucial hai. Isme theoretical aur numerical dono types ke sawal puche jaate hain.`,
        },
        {
          level_number: 3,
          section_type: 'BASIC_CONCEPTS',
          title: 'Level 3: Basic Concepts (Mool Bhoot Siddhant)',
          content_text: `Fundamental principles, operating assumptions, and regulatory considerations governing ${topic.name}.`,
        },
        {
          level_number: 4,
          section_type: 'FORMULAS',
          title: 'Level 4: Important Formulas & Variables (Zaroori Sutra)',
          content_text: `Refer to personal formula book and standard equations applicable to ${topic.name}. Ensure correct SI units during calculations.`,
        },
        {
          level_number: 5,
          section_type: 'SIMPLE_EXAMPLE',
          title: 'Level 5: Simple Example (Aasan Udaharan)',
          content_text: `Direct conceptual step-by-step problem applying the basic formula of ${topic.name}.`,
        },
        {
          level_number: 6,
          section_type: 'GATE_EXAMPLE',
          title: 'Level 6: GATE-Level Example (GATE Pattern Question)',
          content_text: `Multi-step calculation question aligned with standard GATE 2-mark numerical pattern.`,
        },
        {
          level_number: 7,
          section_type: 'PYQ_REVIEW',
          title: 'Level 7: Previous Year GATE Questions Analysis',
          content_text: `Historical question trends and high-frequency traps in ${topic.name}.`,
        },
        {
          level_number: 8,
          section_type: 'TIMED_PRACTICE',
          title: 'Level 8: Quick Revision & Exam Checklist',
          content_text: `Complete the 10-MCQ quiz below to test your retention and complete this topic.`,
        },
      ],
    };
  }

  // Update lesson viewed in progress
  await db.TopicProgress.upsert({
    user_id: userId,
    topic_id: topicId,
    lesson_viewed: true,
    status: TOPIC_STATUS.LEARNING,
  });

  return lesson;
}

module.exports = {
  getTopicDetails,
  getTopicLesson,
};
