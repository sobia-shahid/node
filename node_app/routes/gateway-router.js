const express = require('express');
const router = express.Router();

const controller = require('../controllers/gateway-controller');

router.post('/payment', controller.subscribe);
router.post('/payment/history', controller.savehistory);
router.get('/payment/history', controller.gethistory);
router.get('/invoice/:uid', controller.invoice);
// router.route('/reciept').get(controller.payments);
router.route('/subscriptions/:subid').get(controller.payments);

router.route('/order').post(controller.order);
router.route('/unsubscribe/:subid').post(controller.unsubscribe);
router.route('/reciept').get(controller.reciept);

module.exports = router;
