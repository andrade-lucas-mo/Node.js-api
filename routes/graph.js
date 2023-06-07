const express = require('express');
const router = express.Router();
const login = require('../middleware/login');
const graphController = require('../controllers/graph-controller');

router.post('/create', login.requiredToken, graphController.createGraph)
router.get('/', login.requiredToken, graphController.getNodeData)
router.get('/:vertex', login.requiredToken, graphController.getNodeData)
router.post('/subGraph', login.requiredToken, graphController.getSubGraph)

module.exports = router;