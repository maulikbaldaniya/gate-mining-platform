const { DataTypes, Model } = require('sequelize');

class TestAttempt extends Model {}

module.exports = (sequelize) => {
  TestAttempt.init(
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
      weekly_test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'weekly_tests',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      attempted_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      correct_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      wrong_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      skipped_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      accuracy: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'TestAttempt',
      tableName: 'test_attempts',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['weekly_test_id'],
        },
      ],
    }
  );

  return TestAttempt;
};
