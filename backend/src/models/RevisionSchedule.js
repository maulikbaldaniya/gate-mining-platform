const { DataTypes, Model } = require('sequelize');

class RevisionSchedule extends Model {}

module.exports = (sequelize) => {
  RevisionSchedule.init(
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
      revision_cycle: {
        type: DataTypes.INTEGER, // 1 (+1d), 2 (+3d), 3 (+7d), 4 (+15d), 5 (+30d)
        allowNull: false,
        defaultValue: 1,
      },
      scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'RevisionSchedule',
      tableName: 'revision_schedules',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['scheduled_date'],
        },
        {
          fields: ['is_completed'],
        },
      ],
    }
  );

  return RevisionSchedule;
};
