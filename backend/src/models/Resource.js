const { DataTypes, Model } = require('sequelize');

class Resource extends Model {}

module.exports = (sequelize) => {
  Resource.init(
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      resource_type: {
        type: DataTypes.STRING(30), // VIDEO, PDF, NOTES, FORMULA, PYQ, PRACTICE, REFERENCE
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_free: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Resource',
      tableName: 'resources',
      timestamps: true,
      indexes: [
        {
          fields: ['topic_id'],
        },
        {
          fields: ['resource_type'],
        },
      ],
    }
  );

  return Resource;
};
