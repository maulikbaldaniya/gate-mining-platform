const { DataTypes, Model } = require('sequelize');

class WeeklyTest extends Model {}

module.exports = (sequelize) => {
  WeeklyTest.init(
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
      week_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      total_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
      },
      time_limit_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
      is_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      accuracy: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'WeeklyTest',
      tableName: 'weekly_tests',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'week_number'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['week_number'],
        },
      ],
    }
  );

  return WeeklyTest;
};
