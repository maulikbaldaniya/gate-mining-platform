const { DataTypes, Model } = require('sequelize');

class Subtopic extends Model {}

module.exports = (sequelize) => {
  Subtopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Subtopic',
      tableName: 'subtopics',
      timestamps: true,
      indexes: [
        {
          fields: ['topic_id'],
        },
      ],
    }
  );

  return Subtopic;
};
