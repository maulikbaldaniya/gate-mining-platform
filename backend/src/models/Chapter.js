const { DataTypes, Model } = require('sequelize');

class Chapter extends Model {}

module.exports = (sequelize) => {
  Chapter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Chapter',
      tableName: 'chapters',
      timestamps: true,
      indexes: [
        {
          fields: ['subject_id'],
        },
      ],
    }
  );

  return Chapter;
};
