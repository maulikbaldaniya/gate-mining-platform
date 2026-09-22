const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, scheduleController.getSchedule);
router.get('/backlog', authenticate, scheduleController.getBacklog);
router.post('/set-current-day', authenticate, scheduleController.setCurrentDay);
router.get('/day/:dayNumber', authenticate, scheduleController.getDayDetails);

module.exports = router;
