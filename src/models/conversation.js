const mongoose = require('mongoose');

const conversationsSchema = new mongoose.Schema({
    productID: {
       type: mongoose.mongo.ObjectId,
       ref:'Product'
    },
    buyerID:{
        type:mongoose.mongo.ObjectId,
        ref:'User'
    },
    sellerID:{
        type:mongoose.mongo.ObjectId,
        ref:'User'
    },
    room:{
        type:mongoose.mongo.ObjectId,
        default:function(){
            return new mongoose.mongo.ObjectId()
        }
    },
    read:{
        type:Boolean,
        default:false
    }



},{timestamps:true})

const Conversation = mongoose.model('Conversation',conversationsSchema)

module.exports = Conversation;