const mongoose = require('mongoose');
const { ModuleFilenameHelpers, Module } = require('webpack');

const addressSchema = new mongoose.Schema({
    userID: {type: mongoose.mongo.ObjectId,
        required:true
    },
    fullname: {
        type: String,
        required:true
    },
    city: String,
    state:String,
    postalCode:{
        type:Number,
        required:true
    },
    phone:{
        type:Number
    },
    addressLine:{
        type:String
    }

})

const addressModel = mongoose.model('Address',addressSchema);

module.exports = addressModel;