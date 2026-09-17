const { DataTypes, Model } = require('sequelize');

class Mistake extends Model {}

module.exports = (sequelize) => {
  Mistake.init(
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
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
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
      user_answer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      correct_answer: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(10), // 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'
        defaultValue: 'M1',
      },
      user_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_resolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Mistake',
      tableName: 'mistakes',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['question_id'],
        },
        {
          fields: ['category'],
        },
        {
          fields: ['is_resolved'],
        },
      ],
    }
  );

  return Mistake;
};
