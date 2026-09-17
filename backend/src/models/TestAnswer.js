const { DataTypes, Model } = require('sequelize');

class TestAnswer extends Model {}

module.exports = (sequelize) => {
  TestAnswer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      test_attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'test_attempts',
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
        defaultValue: false,
      },
      time_spent_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'TestAnswer',
      tableName: 'test_answers',
      timestamps: true,
      indexes: [
        {
          fields: ['test_attempt_id'],
        },
        {
          fields: ['question_id'],
        },
      ],
    }
  );

  return TestAnswer;
};
