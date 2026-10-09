const express = require('express');
const router = express.Router();
const quantumController = require('../controllers/quantumPurgeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/instant-purge', authMiddleware, quantumController.executeInstantQuantumPurge);
router.post('/verify-pqc', quantumController.verifyPQCCertificate);

module.exports = router;
