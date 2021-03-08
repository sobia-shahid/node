const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new Schema({
  username: { type: String, required: false },
  name: { type: String, required: false },
  bio: { type: String, required: false },
  website:{ type: String, required: false },
  twitter:{ type: String, required: false },
  facebook:{ type: String, required: false },
  google:{ type: String, required: false },
  linkid:{ type: String, required: false },
  instagram:{ type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: false },
  places: { type: String, required: false },
  isAdmin: { type: Boolean, required: false },
  isEditor: { type: Boolean, required: false }
},{ strict: false });
userSchema.plugin(uniqueValidator);

userSchema.add({restlink:{data:String, default: ''}})
userSchema.add({isSubscribed: { type: Boolean, required: false,default:false }})
userSchema.add({totalbill: { type:String, required: false ,default: '0'}})
userSchema.add({streetAdress: { type:String, required: false ,default: ''}})
userSchema.add({city: { type:String, required: false ,default: ''}})
userSchema.add({country: { type:String, required: false ,default: ''}})
userSchema.add({postalcode: { type:String, required: false ,default: ''}})
userSchema.add({transactionno: { type:String, required: false ,default: ''}})
userSchema.add({state: { type:String, required: false ,default: ''}})

module.exports = mongoose.model("User", userSchema);
//mongoose.model('User').schema.add({restlink:{data:String, default: ''}})
