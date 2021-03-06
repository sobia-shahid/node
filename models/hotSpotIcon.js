const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotSpotIconSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: false },
  placeId: { type: String, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model("HotSpotIcon", hotSpotIconSchema);
