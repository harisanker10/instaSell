
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const Product = require("../models/product");
const Address = require("../models/address");
const User = require("../models/user");
const Request = require("../models/request");
const Order = require('../models/order')
const Configuration = require('../models/configuration');
const Courier = require('../models/courier')
const Conversation = require('../models/conversation');
const convertISODate = require("../utils/formatDate");
const Message = require('../models/messages');

const {getImages} = require('../controllers/productController');






const renderChatPanel = asyncHandler(async (req, res) => {

    const { productID, sellerID } = req.query;
    console.log(productID, sellerID)

    let room = await Conversation.findOne({ sellerID, productID, buyerID: req.session.userID }).lean();
    console.log('room', room)
    if (!room && productID && sellerID) {
        console.log('creating new room')
        const conversation = new Conversation({
            productID,
            sellerID,
            buyerID: req.session.userID
        });
        room = await conversation.save();

    }

    let conversations = await Conversation.find({ $or: [{ buyerID: req.session.userID }, { sellerID: req.session.userID }] })
        .sort({createdAt:-1})
        .populate({
            path: 'sellerID',
            select: 'firstName'
        })
        .populate({
            path: 'productID',
            select: 'title images'
        }).populate({
            path: 'buyerID',
            select: 'firstName'
        })
        .lean();

    conversations = await Promise.all(conversations.map(async (convo) => {

        const buffer = await getImages([convo.productID.images[0]]);
        const base64Image = buffer[0].toString("base64");
        convo.productID.images = `data:image/jpeg;base64,${base64Image}`;
        return convo;
    }))

    console.log(conversations)
    res.render('chats', { title: 'Chats', conversations })

})

const getMessages = asyncHandler(async (req, res) => {

    console.log(req.query.roomID)
    const messages = await Message.find({ roomID: req.query.roomID });
    console.log(messages)
    res.json(messages);

})

const getConversations = asyncHandler(async(req,res)=>{
    let conditions = { $or: [{ buyerID: req.session.userID }, { sellerID: req.session.userID }] };

    if(req.query.productID)conditions = {productID:req.query.productID,sellerID:req.sess}
    
    let conversations = await Conversation.find(conditions)
        .sort({createdAt:-1})
        .populate({
            path: 'sellerID',
            select: 'firstName'
        })
        .populate({
            path: 'productID',
            select: 'title images'
        }).populate({
            path: 'buyerID',
            select: 'firstName'
        })
        .lean();

    conversations = await Promise.all(conversations.map(async (convo) => {

        const buffer = await getImages([convo.productID.images[0]]);
        const base64Image = buffer[0].toString("base64");
        convo.productID.images = `data:image/jpeg;base64,${base64Image}`;
        return convo;
    }))

    res.json(conversations);
})










module.exports = {
    renderChatPanel,
    getMessages,
    getConversations,
   

}