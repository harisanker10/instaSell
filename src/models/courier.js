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
        type:mongoose.mongo.ObjectId,
        required:true,
        ref:'Product'
    },
    trackerID:{
        type:String
    },
    status:{
        type:String
    }
});

const Courier = mongoose.model('Courier',courierSchema);

module.exports = Courier;