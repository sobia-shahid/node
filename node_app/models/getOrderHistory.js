const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var thingSchema = new Schema({}, { strict: false });
module.exports = mongoose.model('orderHistory', thingSchema);