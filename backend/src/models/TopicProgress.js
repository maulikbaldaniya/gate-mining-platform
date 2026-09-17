const { DataTypes, Model } = require('sequelize');
const { TOPIC_STATUS } = require('../constants/topicStatus');

class TopicProgress extends Model {}

module.exports = (sequelize) => {
  TopicProgress.init(
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
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: TOPIC_STATUS.NOT_STARTED,
      },
      best_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      last_score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      attempts_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lesson_viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pyq_reviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_attempted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'TopicProgress',
      tableName: 'topic_progress',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'topic_id'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['topic_id'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  return TopicProgress;
};
