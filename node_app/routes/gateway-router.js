const express = require('express');
const router = express.Router();

const controller = require('../controllers/gateway-controller');

router.post('/subscribe', controller.subscribe);
router.route('/unsubscribe/:subid').post(controller.cancelSubscription);
router.route('/reciepts/:customerId').get(controller.reciepts);

module.exports = router;
