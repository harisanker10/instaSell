
const socketIo = require('socket.io')
const Message = require('./models/messages');
const User = require('./models/user')

const socketIDs = {};

const initializeSocket = (server) => {
    const io = socketIo(server, {
      cors: { origin: '*' }
    });


io.on('connection', async(socket) => {
    console.log('User connected via WebSocket');
    const { userID } = socket.handshake.query;
    const socketID = socket.id;
    socket.username = (await User.findOne({_id:userID},{username:1})).username;
    socketIDs[userID] = socketID;    
    
    socket.on('join', (data) => {
        console.log(data)
        socket.join(data.room);
        socket.room = data.roomID;
        socket.senderID = data.userID;
        socket.recipientID = data.recipientID;
        console.log(`User joined room: ${data.roomID}`);
    });

    socket.on('message', (data) => {
        console.log('data:::::::::::::::',data)
        const {recipientID, productID} = data;
        const socketID = socketIDs[recipientID];
        console.log('socketIDs:::::::::',socketIDs)
        console.log('recipientID::::::::',recipientID)
        io.to(socketID).emit('message',{message:data.message,userID:data.userID,recipientID,productID,username:socket.username});
        // io.to(data.room).emit('message', {message:data.message,userID:data.userID});
        saveMessage(socket.senderID,socket.recipientID,socket.room,data.message);
    });
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
    await mess.save();
}

module.exports = initializeSocket;