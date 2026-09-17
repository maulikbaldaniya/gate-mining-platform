const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/:topicId', authenticate, topicController.getTopic);
router.get('/:topicId/lesson', authenticate, topicController.getLesson);

module.exports = router;
