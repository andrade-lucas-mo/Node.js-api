const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const cityController = require('../controllers/citys-controller');

router.post('/create', login.requiredToken, cityController.createCitys)
router.get('/', login.requiredToken, cityController.getCitys)

module.exports = router;