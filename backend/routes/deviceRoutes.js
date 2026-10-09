const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/list', authMiddleware, deviceController.listDevices);
router.post('/wipe', authMiddleware, deviceController.wipeDevice);

module.exports = router;
