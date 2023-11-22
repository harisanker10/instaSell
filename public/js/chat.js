const userId = document.querySelector('#navbar').getAttribute('userID');
const chatNav = document.querySelector('.chat-nav')
const chatNavSvg = document.querySelector('.chat-nav svg')
const SERVER_URL = document.querySelector('#navbar').getAttribute('SERVER_URL');

const conversationContainer = document.querySelector('.conversations-container')

try{

    if(conversationContainer){
        localStorage.setItem('unread','false')
    }
    
    
    const unread = ()=>{
        chatNavSvg.style.fill = 'red';
        chatNavSvg.style.stroke = 'black';
    }
    
    if(localStorage.getItem('unread') === 'true')unread();

    
    if (userId && userId.toString() != '651e76cae1d0ce2b7cbdf5b4') {
    console.log(userId)
    const socket = io(SERVER_URL, {
        query: {
            userID:userId
        },
    });
    socket.on('message', (data) => {
        window.notify(`
        <div class="m-2">
        <div class="fs-6 border-bottom border-black">New Message</div>
        <span class="mt-1 fs-5">New Message:<span>
        <br>${data.message}
        </div>
        `)
        localStorage.setItem('unread','true');
        unread();
        
    })
    




}
}

catch(err){
    console.log(err)
}