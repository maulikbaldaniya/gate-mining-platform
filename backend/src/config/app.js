const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('../routes');
const errorHandler = require('../middlewares/errorHandler');
const { apiLimiter } = require('../middlewares/rateLimiter');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server) or localhost
      if (!origin || origin.includes('localhost') || origin === clientUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, can restrict in strict production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with request size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: [${req.method}] ${req.originalUrl}`,
    errorCode: 'NOT_FOUND',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
