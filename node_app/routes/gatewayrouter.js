const express = require('express');
const router = express.Router();

const cntrlr = require('../controllers/gatwayController');

router.post('/payment', cntrlr.subscribe);
router.post('/payment/savehistory', cntrlr.savehistory)
router.get('/payment/savehistory/get', cntrlr.gethistory)
router.get('/invoice/:uid', cntrlr.invoice);
router.get('/auth', cntrlr.auth);
router.route('/unsub/:subid').delete(cntrlr.unsubscribe);
router.route('/subscriptions/:subid/payments').get(cntrlr.payments);

module.exports = router;
