const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, searchController.searchAll);

module.exports = router;
