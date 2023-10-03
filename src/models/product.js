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
    details:{
        type:[{String:String}]

    },
    imageID:{
        type:[mongoose.mongo.ObjectId]
    }



})

const product = mongoose.model('Product',productSchema);

module.exports = product;