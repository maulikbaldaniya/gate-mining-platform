const { DataTypes, Model } = require('sequelize');

class QuestionOption extends Model {}

module.exports = (sequelize) => {
  QuestionOption.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      option_key: {
        type: DataTypes.STRING(10), // 'A', 'B', 'C', 'D'
        allowNull: false,
      },
      option_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'QuestionOption',
      tableName: 'question_options',
      timestamps: true,
      indexes: [
        {
          fields: ['question_id'],
        },
      ],
    }
  );

  return QuestionOption;
};
