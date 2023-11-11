const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'admin'
    },
    username:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required: true
    },
    walletBalance:Number

},{timeStamps:true})


const admin = mongoose.model('Admin', adminSchema);

module.exports = admin;