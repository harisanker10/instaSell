const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    category:{
        type: mongoose.mongo.ObjectId,
        required:true
    },
    subCategory:{
        type: mongoose.mongo.ObjectId,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type: String,
        default:''
    },
    details: [
        [
        String,String
    ]
    ],
    images:{
        type:[mongoose.mongo.ObjectId]
    },

    userID:{
        type:mongoose.mongo.ObjectId,
        required:true
    },

    isListed:{
        type:Boolean,
        default: true
    }



},{timestamps:true})

const product = mongoose.model('Product',productSchema);

module.exports = product;