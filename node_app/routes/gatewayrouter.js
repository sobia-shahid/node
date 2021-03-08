const express = require('express');
const router = express.Router();

const controller = require('../controllers/gatwayController');

<<<<<<< HEAD
router.post('/payment', controller.payment);
router.post('/unsub', controller.unsubscribe);
=======
router.post('/payment',cntrlr.payment)
router.get('/invoice/:uid',cntrlr.invoice)

>>>>>>> 90ad30e863d33e14af1f708936c18e34d105bc64

module.exports = router;
