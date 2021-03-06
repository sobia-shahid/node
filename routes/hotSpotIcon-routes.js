const express = require('express')
const router = express.Router()
const hotSpotIconController = require('../controllers/hotSpotIcon-controller')
const { check } = require('express-validator')
const upload = require('./../multer.js')
const fs = require('fs')

router.get('/', hotSpotIconController.getHotSpotIcon)

router.get('/:pid', hotSpotIconController.getHotSpotIconByPlaceId)

// router.get('/user/:uid', hotSpotIconController.getPlacesByUserId)

router.post('/add', hotSpotIconController.addHotSpotIcon)

router.put('/:pid',hotSpotIconController.updateHotSpotIcon)

// router.post('/upload-image', hotSpotIconController.uploadImages)

router.delete('/:pid', hotSpotIconController.deleteHotSpotIcon)

module.exports = router
