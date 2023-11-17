
const socketIo = require('socket.io')
const Message = require('./models/messages');
const User = require('./models/user');
const Conversation = require('./models/conversation');
const mongoose = require('mongoose')

const socketIDs = {};

const initializeSocket = (server) => {
    const io = socketIo(server, {
      cors: { origin: '*' }
    });


io.on('connection', async(socket) => {
    console.log('User connected via WebSocket');
    const { userID } = socket.handshake.query;
    socket.userID = userID;
    const socketID = socket.id;
    socket.username = (await User.findOne({_id:userID},{username:1})).username;
    socketIDs[userID] = socketID;    
    
    // socket.on('join', (data) => {
    //     console.log(data)
    //     socket.join(data.room);
    //     socket.room = data.roomID;
    //     socket.senderID = data.userID;
    //     socket.recipientID = data.recipientID;
    //     console.log(`User joined room: ${data.roomID}`);
    // });asd

    socket.on('message', (data) => {
        console.log('data:::::::::::::::',data)
        const {recipientID, room, message} = data;
        const socketID = socketIDs[recipientID];
        console.log('socketID:::::::::',socketID)
        console.log('recipientID::::::::',recipientID)
        io.to(socketID).emit('message',{message,room});
        // io.to(data.room).emit('message', {message:data.message,userID:data.userID});
        saveMessage(socket.userID,recipientID,room,message);
    });

    socket.on('seen',async(data)=>{
        console.log('seeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeennnnnnnnnnnnnnnn', data)
        await Conversation.findOneAndUpdate({room:data.room},{$set:{seen:true}})
    })
    
});

    


return io;

}

const saveMessage = async(senderID,recipientID,roomID,message)=>{

    
    console.log('saveMessage data:::::::::::',senderID,recipientID,roomID,message)
    if(message.trim() === '')return;
    const mess = new Message({
        roomID: roomID,
        message:message,
        senderID: senderID,
        recipientID: recipientID
    })
    console.log(mess)
    const messRes = await mess.save();
    await Conversation.updateOne({room:roomID},{$set:{lastMessage:messRes._id,seen:false}});

};



module.exports = initializeSocket;