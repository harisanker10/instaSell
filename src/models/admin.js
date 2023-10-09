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

    creationDate:{
        type: Date,
        default: Date.now()
    }

})


const admin = mongoose.model('Admin', adminSchema);

module.exports = admin;