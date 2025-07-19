const express = require('express');
const router = express.Router();
const { ussdHandler,endUssdSession } = require('../controllers/ussd');

// All USSD requests will come to this one endpoint
router.post('/', ussdHandler);
router.post('/endsession',endUssdSession)

module.exports = router;