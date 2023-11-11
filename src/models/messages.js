const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomID: mongoose.mongo.ObjectId,
    senderID:mongoose.mongo.ObjectId,
    recipientID: mongoose.mongo.ObjectId,
    message:String
},{timestamps:true});

const Message = mongoose.model('Message',messageSchema);

module.exports = Message;