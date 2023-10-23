const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    requesterID:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required:true
    },
    productID:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'Product',
        required:true,
    },
    amount:{
        type:mongoose.SchemaTypes.Number
    },
    isAccepted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const Request = mongoose.model('Request',requestSchema);

module.exports = Request;
