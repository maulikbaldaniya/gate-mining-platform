const { DataTypes, Model } = require('sequelize');

class LessonSection extends Model {}

module.exports = (sequelize) => {
  LessonSection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      level_number: {
        type: DataTypes.INTEGER,
        allowNull: false, // Levels 1 through 8
      },
      section_type: {
        type: DataTypes.STRING(50),
        allowNull: false, // CONCEPT, FORMULA, SIMPLE_EXAMPLE, GATE_EXAMPLE, PYQ, TIMED_PRACTICE, etc.
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      content_text: {
        type: DataTypes.TEXT,
        allowNull: false, // Structured Hinglish + English technical explanation
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'LessonSection',
      tableName: 'lesson_sections',
      timestamps: true,
      indexes: [
        {
          fields: ['lesson_id'],
        },
        {
          fields: ['level_number'],
        },
      ],
    }
  );

  return LessonSection;
};
