const { DataTypes, Model } = require('sequelize');

class StudyDay extends Model {}

module.exports = (sequelize) => {
  StudyDay.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      day_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      week_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'StudyDay',
      tableName: 'study_days',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['day_number'],
        },
        {
          fields: ['week_number'],
        },
      ],
    }
  );

  return StudyDay;
};
