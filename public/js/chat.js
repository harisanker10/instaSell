const userId = document.querySelector('#navbar').getAttribute('userID');
const chatNav = document.querySelector('.chat-nav')
const chatNavSvg = document.querySelector('.chat-nav svg')

const conversationContainer = document.querySelector('.conversations-container')


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
    const socket = io('http://localhost:5555', {
        query: {
            userID:userId
        },
    });
    socket.on('message', (data) => {
        window.notify(`
        <div class="m-2">
        <div class="fs-6 border-bottom border-black">New Message</div>
        <span class="mt-1 fs-5">${data.username}:<span>
        <br>${data.message}
        </div>
        `)
        localStorage.setItem('unread','true');
        unread();
        
    })





}