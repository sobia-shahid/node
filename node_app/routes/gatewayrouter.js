const express = require ("express")
const router = express.Router()

const cntrlr = require ('../controllers/gatwayController')

router.post('/payment',cntrlr.payment)
router.get('/invoice/:uid',cntrlr.invoice)


module.exports = router