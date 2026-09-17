const { DataTypes, Model } = require('sequelize');

class Topic extends Model {}

module.exports = (sequelize) => {
  Topic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      chapter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chapters',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      estimated_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 45,
      },
      is_core: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Topic',
      tableName: 'topics',
      timestamps: true,
      indexes: [
        {
          fields: ['chapter_id'],
        },
        {
          fields: ['subject_id'],
        },
      ],
    }
  );

  return Topic;
};
