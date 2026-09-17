const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyqController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, pyqController.getPYQs);

module.exports = router;
