const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const convertISODate = require('../utils/formatDate')



const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  secondName: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    unique: true,
    set: function (value) {
      return value.replace(/\s+/g, '')
    }
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    default: ''
  },
  guid: {
    type: String
  },
  phone: {
    type: String,
  },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  rating: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId],
    ref:'Product'
  },
  receivingAccount: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isBlocked:
  {
    type: Boolean,
    default: false
  },
  walletBalance:{
   type: Number,
   default: 0
  }

}, { timestamps: true });


userSchema.methods.checkPassword = async function (password) {
  if (!password || !this.password) return false;
  return await bcrypt.compare(password, this.password)

}


userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password !== '') {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
})





userSchema.statics.checkUserExist = async function (username, email, phone) {
  let conditions = [];
  if (username) conditions.push({ username: username });
  if (email) conditions.push({ email: email });
  if (phone) conditions.push({ phone: phone });

  console.log('conditions',conditions)
  const count = await this.countDocuments({ $or: conditions });
  console.log('count:::',count)
  return count;
}

userSchema.statics.getUser = async function (userID) {
  if (!userID) {
    const users = await this.find().lean();
    users.forEach(user => {
      user.createdAt = convertISODate(user.createdAt);
      user.updatedAt = convertISODate(user.updatedAt);
    })
    return users;
  }
  const user = await this.findOne({ _id: userID }).lean();

  user.createdAt = convertISODate(user.createdAt);
  user.updatedAt = convertISODate(user.updatedAt);

  return user;
}




const user = mongoose.model('User', userSchema);

module.exports = user;