const { DataTypes, Model } = require('sequelize');

class WeeklyTestTopic extends Model {}

module.exports = (sequelize) => {
  WeeklyTestTopic.init(
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
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'WeeklyTestTopic',
      tableName: 'weekly_test_topics',
      timestamps: true,
      indexes: [
        {
          fields: ['weekly_test_id'],
        },
        {
          fields: ['topic_id'],
        },
      ],
    }
  );

  return WeeklyTestTopic;
};
