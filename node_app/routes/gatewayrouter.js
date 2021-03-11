const express = require('express');
const router = express.Router();

const controller = require('../controllers/gatwayController');

router.post('/payment', controller.payment);
router.post('/unsub', controller.unsubscribe);
router.get('/invoice/:uid', controller.invoice);

module.exports = router;
