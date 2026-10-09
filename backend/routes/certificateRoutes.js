const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.get('/', certificateController.listCertificates);
router.get('/verify/:idOrHash', certificateController.verifyCertificate);

module.exports = router;
