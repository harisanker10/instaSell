const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    carrier:{
        type:String,
        required:true
    },
    courierID:{
        type:String,
    },
    productID:{
        type:String,
        required:true,
        ref:'Product'
    },
    status:{
        type:String
    }
});

const Courier = mongoose.model('Courier',courierSchema);

module.exports = Courier;