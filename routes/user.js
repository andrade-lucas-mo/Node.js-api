const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.post('/singin', userController.singinUser)
router.post('/login', userController.loginUser)

module.exports = router;