const mongoose = require('mongoose');

const adminAcc = new mongoose.Schema({
    role: {
        type: String,
        default: admin
    },
    username:{
        type: String,
        required:True
    },
    password:{
        type: String,
        required: True
    },

    createdAt:{
        type: Date,
        default: Date.now()
    }

})