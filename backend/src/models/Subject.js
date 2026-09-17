const { DataTypes, Model } = require('sequelize');

class Subject extends Model {}

module.exports = (sequelize) => {
  Subject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      exam_year: {
        type: DataTypes.INTEGER,
        defaultValue: 2027,
      },
      content_version: {
        type: DataTypes.STRING(20),
        defaultValue: '2027-v1',
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Subject',
      tableName: 'subjects',
      timestamps: true,
    }
  );

  return Subject;
};
