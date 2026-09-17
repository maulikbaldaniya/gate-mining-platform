const { sequelize } = require('../config/database');

const UserModel = require('./User');
const SubjectModel = require('./Subject');
const ChapterModel = require('./Chapter');
const TopicModel = require('./Topic');
const SubtopicModel = require('./Subtopic');
const StudyDayModel = require('./StudyDay');
const DayTopicModel = require('./DayTopic');
const LessonModel = require('./Lesson');
const LessonSectionModel = require('./LessonSection');
const QuestionModel = require('./Question');
const QuestionOptionModel = require('./QuestionOption');
const QuestionAttemptModel = require('./QuestionAttempt');
const TopicProgressModel = require('./TopicProgress');
const DailyProgressModel = require('./DailyProgress');
const WeeklyTestModel = require('./WeeklyTest');
const WeeklyTestTopicModel = require('./WeeklyTestTopic');
const WeeklyTestQuestionModel = require('./WeeklyTestQuestion');
const TestAttemptModel = require('./TestAttempt');
const TestAnswerModel = require('./TestAnswer');
const RevisionScheduleModel = require('./RevisionSchedule');
const MistakeModel = require('./Mistake');
const FormulaBookModel = require('./FormulaBook');
const UserStreakModel = require('./UserStreak');
const ResourceModel = require('./Resource');

const User = UserModel(sequelize);
const Subject = SubjectModel(sequelize);
const Chapter = ChapterModel(sequelize);
const Topic = TopicModel(sequelize);
const Subtopic = SubtopicModel(sequelize);
const StudyDay = StudyDayModel(sequelize);
const DayTopic = DayTopicModel(sequelize);
const Lesson = LessonModel(sequelize);
const LessonSection = LessonSectionModel(sequelize);
const Question = QuestionModel(sequelize);
const QuestionOption = QuestionOptionModel(sequelize);
const QuestionAttempt = QuestionAttemptModel(sequelize);
const TopicProgress = TopicProgressModel(sequelize);
const DailyProgress = DailyProgressModel(sequelize);
const WeeklyTest = WeeklyTestModel(sequelize);
const WeeklyTestTopic = WeeklyTestTopicModel(sequelize);
const WeeklyTestQuestion = WeeklyTestQuestionModel(sequelize);
const TestAttempt = TestAttemptModel(sequelize);
const TestAnswer = TestAnswerModel(sequelize);
const RevisionSchedule = RevisionScheduleModel(sequelize);
const Mistake = MistakeModel(sequelize);
const FormulaBook = FormulaBookModel(sequelize);
const UserStreak = UserStreakModel(sequelize);
const Resource = ResourceModel(sequelize);

// --- Associations ---

// Subject <-> Chapter
Subject.hasMany(Chapter, { foreignKey: 'subject_id', as: 'chapters' });
Chapter.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Subject <-> Topic
Subject.hasMany(Topic, { foreignKey: 'subject_id', as: 'topics' });
Topic.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Chapter <-> Topic
Chapter.hasMany(Topic, { foreignKey: 'chapter_id', as: 'topics' });
Topic.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });

// Topic <-> Subtopic
Topic.hasMany(Subtopic, { foreignKey: 'topic_id', as: 'subtopics' });
Subtopic.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// StudyDay <-> DayTopic <-> Topic
StudyDay.hasMany(DayTopic, { foreignKey: 'day_id', as: 'dayTopics' });
DayTopic.belongsTo(StudyDay, { foreignKey: 'day_id', as: 'studyDay' });
Topic.hasMany(DayTopic, { foreignKey: 'topic_id', as: 'dayTopics' });
DayTopic.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// Topic <-> Lesson <-> LessonSection
Topic.hasOne(Lesson, { foreignKey: 'topic_id', as: 'lesson' });
Lesson.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
Lesson.hasMany(LessonSection, { foreignKey: 'lesson_id', as: 'sections' });
LessonSection.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// Topic <-> Question <-> QuestionOption
Topic.hasMany(Question, { foreignKey: 'topic_id', as: 'questions' });
Question.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
Question.hasMany(QuestionOption, { foreignKey: 'question_id', as: 'options' });
QuestionOption.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// Question <-> QuestionAttempt <-> User
User.hasMany(QuestionAttempt, { foreignKey: 'user_id', as: 'attempts' });
QuestionAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Question.hasMany(QuestionAttempt, { foreignKey: 'question_id', as: 'attempts' });
QuestionAttempt.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// User <-> TopicProgress <-> Topic
User.hasMany(TopicProgress, { foreignKey: 'user_id', as: 'topicProgress' });
TopicProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Topic.hasMany(TopicProgress, { foreignKey: 'topic_id', as: 'userProgress' });
TopicProgress.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// User <-> DailyProgress <-> StudyDay
User.hasMany(DailyProgress, { foreignKey: 'user_id', as: 'dailyProgress' });
DailyProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
StudyDay.hasMany(DailyProgress, { foreignKey: 'day_id', as: 'userProgress' });
DailyProgress.belongsTo(StudyDay, { foreignKey: 'day_id', as: 'studyDay' });

// User <-> WeeklyTest
User.hasMany(WeeklyTest, { foreignKey: 'user_id', as: 'weeklyTests' });
WeeklyTest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// WeeklyTest <-> WeeklyTestTopic <-> Topic
WeeklyTest.hasMany(WeeklyTestTopic, { foreignKey: 'weekly_test_id', as: 'testTopics' });
WeeklyTestTopic.belongsTo(WeeklyTest, { foreignKey: 'weekly_test_id', as: 'weeklyTest' });
WeeklyTestTopic.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// WeeklyTest <-> WeeklyTestQuestion <-> Question
WeeklyTest.hasMany(WeeklyTestQuestion, { foreignKey: 'weekly_test_id', as: 'testQuestions' });
WeeklyTestQuestion.belongsTo(WeeklyTest, { foreignKey: 'weekly_test_id', as: 'weeklyTest' });
WeeklyTestQuestion.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// WeeklyTest <-> TestAttempt <-> TestAnswer
WeeklyTest.hasMany(TestAttempt, { foreignKey: 'weekly_test_id', as: 'attempts' });
TestAttempt.belongsTo(WeeklyTest, { foreignKey: 'weekly_test_id', as: 'weeklyTest' });
TestAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
TestAttempt.hasMany(TestAnswer, { foreignKey: 'test_attempt_id', as: 'answers' });
TestAnswer.belongsTo(TestAttempt, { foreignKey: 'test_attempt_id', as: 'attempt' });
TestAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// User <-> RevisionSchedule <-> Topic
User.hasMany(RevisionSchedule, { foreignKey: 'user_id', as: 'revisions' });
RevisionSchedule.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Topic.hasMany(RevisionSchedule, { foreignKey: 'topic_id', as: 'revisions' });
RevisionSchedule.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// User <-> Mistake <-> Question / Topic
User.hasMany(Mistake, { foreignKey: 'user_id', as: 'mistakes' });
Mistake.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Question.hasMany(Mistake, { foreignKey: 'question_id', as: 'mistakes' });
Mistake.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Topic.hasMany(Mistake, { foreignKey: 'topic_id', as: 'mistakes' });
Mistake.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// User <-> FormulaBook <-> Topic / Subject
User.hasMany(FormulaBook, { foreignKey: 'user_id', as: 'formulas' });
FormulaBook.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Topic.hasMany(FormulaBook, { foreignKey: 'topic_id', as: 'formulas' });
FormulaBook.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });
Subject.hasMany(FormulaBook, { foreignKey: 'subject_id', as: 'formulas' });
FormulaBook.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// User <-> UserStreak
User.hasOne(UserStreak, { foreignKey: 'user_id', as: 'streak' });
UserStreak.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Topic <-> Resource
Topic.hasMany(Resource, { foreignKey: 'topic_id', as: 'resources' });
Resource.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

const { Sequelize, Op } = require('sequelize');

const db = {
  sequelize,
  Sequelize,
  Op,
  User,
  Subject,
  Chapter,
  Topic,
  Subtopic,
  StudyDay,
  DayTopic,
  Lesson,
  LessonSection,
  Question,
  QuestionOption,
  QuestionAttempt,
  TopicProgress,
  DailyProgress,
  WeeklyTest,
  WeeklyTestTopic,
  WeeklyTestQuestion,
  TestAttempt,
  TestAnswer,
  RevisionSchedule,
  Mistake,
  FormulaBook,
  UserStreak,
  Resource,
};

module.exports = db;
