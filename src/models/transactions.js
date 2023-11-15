const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type:{
        type:String,
        enum: ['user_to_admin_stripe', 'admin_to_user_payment', 'user_wallet_top_up', 'user_to_admin_wallet']
    },
    senderID:{
        type:mongoose.mongo.ObjectId,
        ref:'User'
    },
    receivedID:{
        type:mongoose.mongo.ObjectId,
        ref:'User'
    },
    transactionID:{
        type:String
    },
    toAdmin: {
        type:Boolean,
        default:false
    },
    fromAdmin:{
        type:Boolean,
        default:false
    },
    amount:{
        type:Number  
    },
    status:{
        type:String,
        enum:['paid','unpaid','declined']
    },
    order:{
        type:mongoose.mongo.ObjectId,
        ref: 'Order'
    }
},{timestamps:true})

const Transaction = mongoose.model('Transaction',transactionSchema);

module.exports = Transaction;