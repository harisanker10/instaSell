const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    secondName: { type: String, default: '' },
    username: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    guid:{type:String},
    phone: String,
    profilePicture: {
      data: Buffer,
      contentType: String,
    },
    rating: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    wishlist: [mongoose.Schema.Types.ObjectId],
    receivingAccount: mongoose.Schema.Types.ObjectId,
    isBlocked : {type: Boolean, default: false}
  },{timestamps : true});
  

const user = mongoose.model('User', userSchema);

module.exports = user;