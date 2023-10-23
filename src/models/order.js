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
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [placed, inTransit, delivered],
        default:'placed'
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: 'Address'
    },
    courier: {
        carrier: String,
        trackingId: String
    },
    buyerTransaction: mongoose.Types.ObjectId,
    sellerTransaction: mongoose.Types.ObjectId

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;