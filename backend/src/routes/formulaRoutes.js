const express = require('express');
const router = express.Router();
const formulaController = require('../controllers/formulaController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, formulaController.getFormulas);
router.post('/toggle-bookmark', authenticate, formulaController.toggleBookmark);

module.exports = router;
