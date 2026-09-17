const { DataTypes, Model } = require('sequelize');

class DailyProgress extends Model {}

module.exports = (sequelize) => {
  DailyProgress.init(
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
      day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'study_days',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      topics_completed_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_topics_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'DailyProgress',
      tableName: 'daily_progress',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'day_id'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['day_id'],
        },
      ],
    }
  );

  return DailyProgress;
};
