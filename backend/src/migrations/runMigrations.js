const db = require('../models');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('Starting database migration / synchronization...');
    await db.sequelize.authenticate();
    logger.info(`Connected to ${db.sequelize.getDialect().toUpperCase()} database.`);

    // Synchronize all models
    await db.sequelize.sync({ alter: false });
    logger.info('All database tables synchronized successfully.');

    const tables = await db.sequelize.getQueryInterface().showAllTables();
    logger.info(`Synchronized ${tables.length} tables:`, tables);

    return true;
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations().then(() => {
    logger.info('Migration complete. Exiting.');
    process.exit(0);
  });
}

module.exports = runMigrations;
