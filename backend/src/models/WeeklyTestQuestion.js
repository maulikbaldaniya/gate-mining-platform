const { DataTypes, Model } = require('sequelize');

class WeeklyTestQuestion extends Model {}

module.exports = (sequelize) => {
  WeeklyTestQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      weekly_test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'weekly_tests',
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
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'WeeklyTestQuestion',
      tableName: 'weekly_test_questions',
      timestamps: true,
      indexes: [
        {
          fields: ['weekly_test_id'],
        },
        {
          fields: ['question_id'],
        },
      ],
    }
  );

  return WeeklyTestQuestion;
};
