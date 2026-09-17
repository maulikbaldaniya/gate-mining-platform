const { DataTypes, Model } = require('sequelize');

class UserStreak extends Model {}

module.exports = (sequelize) => {
  UserStreak.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      current_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      longest_streak: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      last_active_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_days_studied: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      badges: {
        type: DataTypes.JSON, // array of unlocked badges
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'UserStreak',
      tableName: 'user_streaks',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id'],
        },
      ],
    }
  );

  return UserStreak;
};
