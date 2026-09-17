const { DataTypes, Model } = require('sequelize');

class QuestionAttempt extends Model {}

module.exports = (sequelize) => {
  QuestionAttempt.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_answer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      time_spent_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      attempt_type: {
        type: DataTypes.STRING(30),
        defaultValue: 'QUIZ', // 'QUIZ', 'WEEKLY_TEST', 'REVISION', 'PRACTICE'
      },
      related_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'QuestionAttempt',
      tableName: 'question_attempts',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['question_id'],
        },
        {
          fields: ['attempt_type'],
        },
      ],
    }
  );

  return QuestionAttempt;
};
