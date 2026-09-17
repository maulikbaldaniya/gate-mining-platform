const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validateRequest');
const { testSubmitSchema } = require('../validators/submissionValidator');

router.get('/weekly/status', authenticate, testController.getWeeklyTestStatus);
router.post('/weekly/generate', authenticate, testController.generateWeeklyTest);
router.post('/weekly/:testId/start', authenticate, testController.startWeeklyTest);
router.post('/weekly/:testId/submit', authenticate, validateBody(testSubmitSchema), testController.submitWeeklyTest);

module.exports = router;
