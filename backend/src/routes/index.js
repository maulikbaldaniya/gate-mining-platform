const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const topicRoutes = require('./topicRoutes');
const quizRoutes = require('./quizRoutes');
const testRoutes = require('./testRoutes');
const revisionRoutes = require('./revisionRoutes');
const mistakeRoutes = require('./mistakeRoutes');
const formulaRoutes = require('./formulaRoutes');
const pyqRoutes = require('./pyqRoutes');
const progressRoutes = require('./progressRoutes');
const searchRoutes = require('./searchRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/topics', topicRoutes);
router.use('/quiz', quizRoutes);
router.use('/tests', testRoutes);
router.use('/revision', revisionRoutes);
router.use('/mistakes', mistakeRoutes);
router.use('/formulas', formulaRoutes);
router.use('/pyqs', pyqRoutes);
router.use('/progress', progressRoutes);
router.use('/search', searchRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GATE Mining Engineering 120-Day Learning Platform',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

module.exports = router;
