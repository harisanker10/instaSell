const userID = document.querySelector('.chat-container').getAttribute('userID');
const socket = io('http://localhost:5555', {
    query: {
        userID
    },
});
const chats = document.querySelectorAll('.room');
const chatContainer = document.querySelector('.chat-container');
const input = document.querySelector('.message-input')
const sendBtn = document.querySelector('.send-btn')
const convoContainer = document.querySelector('.conversations-container');

const convoTemplate = `<% conversations.forEach(chat=> { %>

    <button class="on-click-btn room w-100 border-bottom
    <% if(chat.isUnread){ %>
        unread
    <%}%>
    
    " style="height: 5rem;" room="<%= chat?.room || '' %>" senderID="<%= userID %>" recipientID="
        <% if (userID.toString() === chat.buyerID._id.toString()) { %>
            <%= chat.sellerID._id %>
        <% } else{%>
                <%= chat.buyerID._id %>                        
            <% } %>" productID="<%= chat.productID._id %>">
        <div class="w-100  d-flex  align-items-center">
            
            <div class="img-container border mx-4" style="height: 4rem; width: 4rem;">
                <img src="<%=chat.productID.images%>" alt="" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span class="text-uppercase">
                <% if (chat.sellerID._id.toString() === userID.toString()) { %>
                    <%= chat.buyerID.firstName %>
                        <% } else { %>
                            <%= chat?.sellerID?.firstName || '' %>
                                <% }%>
            </span>
        </div>
    </button>
    <% }) %>
`


socket.on('message', (data) => {
    let found = false;
    const manageIncoming = () => {
        const chats = document.querySelectorAll('.room')
        chats.forEach(chat => {
            const recipientID = chat.getAttribute('recipientID').trim();
            const productID = chat.getAttribute('productID').trim();


            console.log('product id of each chat:::', productID)
            if (data.userID.toString() === recipientID.toString() && productID.toString() === data.productID.toString()) {
                if (chat.classList.contains('active')) {
                    const div = document.createElement('div');
                    div.innerHTML = message;
                    if (userID.toString() === senderID.toString()) div.classList.add('sent')
                    else div.classList.add('received')
                    chatContainer.append(div);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    found = true;
                    return;

                }
                else {
                    chat.classList.add('unread');
                    found = true;
                }
            }

        })
    }
    const { message, userID: senderID } = data;
    console.log('message:::::::', data);
    console.log('incoming product ID:', data.productID)
    manageIncoming();
    if (!found) {
        fetch('/chats/getConversations')
            .then(res => res.json())
            .then(res => {
                const html = ejs.render(convoTemplate, { conversations: res });
                convoContainer.innerHTML = html;
                main();
                manageIncoming();
            })

    }
})



const main = () => {
    const chats = document.querySelectorAll('.room');
    chats.forEach(chat => {
        
        const roomID = chat.getAttribute('room').trim()

        chat.addEventListener('click', (event) => {
            
            chat.classList.remove('unread');
            chats.forEach(chat => chat.classList.remove('active'))

            console.log('elon ma')
            event.preventDefault();
            chat.classList.add('active')

            const userID = chat.getAttribute('senderID').trim();
            const recipientID = chat.getAttribute('recipientID').trim();
            const productID = chat.getAttribute('productID').trim();
            console.log('productID:::::::', productID)

            socket.emit('join', { roomID, userID, recipientID, productID });

            sendBtn.addEventListener('click', (event) => {
                const productID = document.querySelector('.active').getAttribute('productID')
                event.preventDefault();
                if (input.value.trim() === '') return;
                console.log('sending productID', productID)
                socket.emit('message', { message: input.value, roomID, userID, recipientID, productID })
                const div = document.createElement('div');
                div.innerHTML = input.value;
                div.classList.add('sent')
                chatContainer.append(div);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                input.value = ''
            })

            fetch(`/chats/messages?roomID=${roomID}`)
                .then(res => res.json())
                .then(res => {
                    console.log(res)
                    chatContainer.innerHTML = '';
                    res.forEach(mess => {
                        const div = document.createElement('div');
                        if (mess.senderID.toString() === userID.toString()) {
                            div.classList.add('sent')
                        } else {
                            div.classList.add('received')
                        }
                        div.innerHTML = mess.message;
                        chatContainer.append(div);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    })




                })

        })
    });
}

main();

