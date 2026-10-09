const express = require('express');
const router = express.Router();
const wipeController = require('../controllers/wipeController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/check-admin', wipeController.checkAdminPrivileges);
router.post('/browse', authMiddleware, wipeController.browseLocalDirectory);
router.post('/local', authMiddleware, wipeController.wipeLocalFile);
router.post('/upload', authMiddleware, upload.single('file'), wipeController.wipeUploadedFile);
router.post('/url', authMiddleware, wipeController.wipeUrl);

module.exports = router;
