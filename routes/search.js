const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const searchController = require('../controllers/search-controller');

router.get('/breadth-first', login.requiredToken, searchController.searchBreadthFirst)
router.get('/depth', login.requiredToken, searchController.searchDepth)

module.exports = router;