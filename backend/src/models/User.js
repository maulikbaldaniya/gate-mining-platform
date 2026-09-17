const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

module.exports = (sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      target_exam: {
        type: DataTypes.STRING(50),
        defaultValue: 'GATE 2027 Mining Engineering (MN)',
      },
      start_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      current_day: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'Asia/Kolkata',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
      ],
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(user.password_hash, salt);
          }
        },
      },
    }
  );

  return User;
};
