const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');
const { quizSubmitSchema } = require('../validators/submissionValidator');

router.get('/topic/:topicId', authenticate, quizController.getTopicQuiz);
router.post('/submit', authenticate, validateBody(quizSubmitSchema), quizController.submitTopicQuiz);

module.exports = router;
