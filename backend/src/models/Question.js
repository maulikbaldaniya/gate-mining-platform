const { DataTypes, Model } = require('sequelize');

class Question extends Model {}

module.exports = (sequelize) => {
  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subtopic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'subtopics',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      type: {
        type: DataTypes.STRING(20),
        defaultValue: 'MCQ',
      },
      difficulty: {
        type: DataTypes.STRING(20),
        defaultValue: 'MEDIUM',
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      correct_answer: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      explanation_json: {
        type: DataTypes.JSON, // { concept, why_correct, why_wrong, formula, common_mistake, revision_summary }
        allowNull: true,
      },
      is_pyq: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pyq_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      is_official: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      timestamps: true,
      indexes: [
        {
          fields: ['topic_id'],
        },
        {
          fields: ['difficulty'],
        },
        {
          fields: ['is_pyq'],
        },
        {
          fields: ['pyq_year'],
        },
      ],
    }
  );

  return Question;
};
