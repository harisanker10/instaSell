const prevBtn = document.querySelector("#prev");
const nextBtn = document.querySelector("#next");
const homeBtn = document.querySelector("#home");
let skip = 0;
const tBody = document.querySelector(".table-body");

const usersFetch = ()=>{
fetch(`/getUsers?skip=${skip}`)
    .then(res =>{
        console.log(res);
        return res.json()})
    .then(data => {
        console.log(data);

        const html = ejs.render(template, {
            users:data
        });
        tBody.innerHTML = html;
    })
}
const template = `<% users.forEach(element=> { %>



    <tr class="w-100 text-center">
        <td class="">
            <%=element.username%>
        </td>
        <td>
            <%=element.email%>
        </td>
        <td>
            <%=element.phone%>
        </td>
        <td>
            <%=element.createdAt%>
        </td>
        <td>
            <% if (element.isBlocked) { %>
            <a id="block-user-btn" class="default-black-btn p-2 px-4 text-decoration-none" href="/blockuser?unblock=<%= element._id %>" >
                    UNBLOCK
                </a>
                    <% } else{%>
                        <a id="block-user-btn" class="default-black-btn p-2 px-4 text-decoration-none" href="/blockuser?block=<%= element._id %>" >
                            BLOCK
                        </a>
                        <% } %>   
        </td>
    </tr>

    
    <% }) %>`;


prevBtn.addEventListener('click', () => {
    skip -= 10;
    usersFetch();
})
nextBtn.addEventListener('click', () => {
    skip += 10;
    usersFetch();
})
homeBtn.addEventListener('click', () => {
    skip = 0;
    usersFetch();
})


