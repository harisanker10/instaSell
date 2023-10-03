const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: String,
    profilePicture: {
      data: Buffer,
      contentType: String,
    },
    creationDate: { type: Date, default: Date.now },
    rating: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    wishlist: [mongoose.Schema.Types.ObjectId],
    receivingAccount: mongoose.Schema.Types.ObjectId,
    isBlocked : {type: Boolean, default: false}
  });
  

const user = mongoose.model('User', userSchema);

module.exports = user;