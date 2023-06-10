const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const forestController = require('../controllers/forest-controller');

router.get('/minimum-tree/:node', login.requiredToken, forestController.minimumTree)

module.exports = router;