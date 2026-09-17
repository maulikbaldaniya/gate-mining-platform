const { DataTypes, Model } = require('sequelize');

class FormulaBook extends Model {}

module.exports = (sequelize) => {
  FormulaBook.init(
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
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'topics',
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
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      formula_latex: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      variable_meanings: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      units: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      when_to_use: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      common_traps: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      example_problem: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_bookmarked: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'FormulaBook',
      tableName: 'formula_books',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['topic_id'],
        },
        {
          fields: ['subject_id'],
        },
      ],
    }
  );

  return FormulaBook;
};
