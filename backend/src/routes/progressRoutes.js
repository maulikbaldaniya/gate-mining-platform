const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/overview', authenticate, progressController.getProgressOverview);
router.get('/subjects', authenticate, progressController.getSubjectProgress);

module.exports = router;
