const { Sequelize } = require('sequelize');
const path = require('path');
const pg = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const dbDialect = process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite');

let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSQL URL connection (Neon, Render, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    protocol: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: isProduction ? false : (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else if (dbDialect === 'postgres' && process.env.DB_NAME) {
  // PostgreSQL discrete credentials
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectModule: pg,
      logging: isProduction ? false : (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  // SQLite local development fallback
  const storagePath = process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite');
  logger.info(`Using SQLite database at ${storagePath}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info(`Database connected successfully using [${sequelize.getDialect().toUpperCase()}] dialect.`);
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
};
