const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const pathController = require('../controllers/path-controller');

router.post('/shortest', login.requiredToken, pathController.shortestPath)

module.exports = router;