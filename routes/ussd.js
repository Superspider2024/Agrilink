const express = require('express');
const router = express.Router();
const { ussdHandler } = require('../controllers/ussd');

// All USSD requests will come to this one endpoint
router.post('/', ussdHandler);

module.exports = router;