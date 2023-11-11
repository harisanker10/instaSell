const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerID: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    sellerID: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    productID:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Product'
    },
    price: {
        listPrice: Number,
        transactionPercent: Number,
        totalPrice:Number,
    },
    status: {
        type: String,
        default: 'placed'
    },
    address: {
        type: mongoose.mongo.ObjectId,
        ref: 'Address'
    },
    courier: {
        carrier: String,
        trackingId: String
    },
    stripeTransactionId: {
        type: String,
        required: true

    }}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;