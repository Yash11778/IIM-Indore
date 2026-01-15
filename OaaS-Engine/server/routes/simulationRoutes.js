const express = require('express');
const router = express.Router();
const SimulationController = require('../controllers/SimulationController');

router.post('/start', SimulationController.startSimulation);
router.post('/turn', SimulationController.handleTurn);
router.get('/results', SimulationController.getResults);

module.exports = router;
