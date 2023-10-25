const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    value:{
        type: mongoose.Schema.Types.Mixed
    }
    
})

const Configuration = mongoose.model('Configuration',configurationSchema);

module.exports = Configuration;