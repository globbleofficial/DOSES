const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/scan', authMiddleware, recoveryController.scanForDeletedFiles);
router.get('/download/:filename', recoveryController.downloadRecoveredFile);

module.exports = router;
