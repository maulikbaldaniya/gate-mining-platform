require('dotenv').config();
const app = require('./config/app');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Verify Database connection
    await testConnection();

    // 2. Start listening
    const server = app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`GATE Mining Engineering 120-Day API Server Running!`);
      logger.info(`Port: http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info(`=======================================================`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
