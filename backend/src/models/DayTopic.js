const { DataTypes, Model } = require('sequelize');

class DayTopic extends Model {}

module.exports = (sequelize) => {
  DayTopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'study_days',
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
      sequence: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      estimated_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 45,
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'DayTopic',
      tableName: 'day_topics',
      timestamps: true,
      indexes: [
        {
          fields: ['day_id'],
        },
        {
          fields: ['topic_id'],
        },
      ],
    }
  );

  return DayTopic;
};
