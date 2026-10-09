const express = require('express');
const router = express.Router();
const salesforceController = require('../controllers/salesforceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/status', salesforceController.getSalesforceStatus);
router.post('/sync', authMiddleware, salesforceController.syncSanitizationToSalesforce);

module.exports = router;
