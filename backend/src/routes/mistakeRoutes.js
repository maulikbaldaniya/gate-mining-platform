const express = require('express');
const router = express.Router();
const mistakeController = require('../controllers/mistakeController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, mistakeController.getMistakes);
router.patch('/:mistakeId', authenticate, mistakeController.updateMistake);

module.exports = router;
