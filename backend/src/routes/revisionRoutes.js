const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/today', authenticate, revisionController.getTodayRevisions);
router.post('/:revisionId/complete', authenticate, revisionController.completeRevision);

module.exports = router;
