const express = require('express');
const router = express.Router();
const SimulationController = require('../controllers/SimulationController');

router.post('/start', SimulationController.startSimulation);
router.post('/turn', SimulationController.handleTurn);
router.get('/results', SimulationController.getResults);
router.get('/candidates', SimulationController.getCandidates);
router.post('/register', SimulationController.registerUser);
router.post('/login', SimulationController.loginUser);
router.post('/code-submit', SimulationController.submitCode);
router.delete('/session/:sessionId', SimulationController.deleteCandidate);
router.post('/session/:sessionId/snapshot', SimulationController.uploadSnapshot);

module.exports = router;
