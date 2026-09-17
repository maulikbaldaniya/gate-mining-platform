const { DataTypes, Model } = require('sequelize');

class Lesson extends Model {}

module.exports = (sequelize) => {
  Lesson.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      overview: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estimated_read_time: {
        type: DataTypes.INTEGER,
        defaultValue: 20, // in minutes
      },
    },
    {
      sequelize,
      modelName: 'Lesson',
      tableName: 'lessons',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['topic_id'],
        },
      ],
    }
  );

  return Lesson;
};
