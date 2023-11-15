const gridTemplate = `<div class="grid-container p-4">
<% data.forEach(elt=> { %>


    <a href="/product?id=<%=elt._id%>">

        <div class="card text-center list-card product-card">

            <div class="unlisted-overlay
            <% if (elt.isListed) { %>
             
                hide    
                <% } %>
                "></div>


            <div class="card-controls " style = "height:5rem; top:0;">
                <button class="default-black-btn wishlist-btn px-2 py-1" productID="<%=elt._id%>" style="height:2rem">Remove</button>
            </div>


            <div class="img-container">
            <img class="list-card-img" src="data:image/;base64,<%=elt.images[0].toString('base64') || ''%>"
                alt="Title">
        </div>

            <span class="card-price">
                ₹<%=elt.price%>
            </span>
            <span class="card-title">
                <%=elt.title%>
            </span>
            <div class="location-container w-100 mt-3 text-muted">

                <span class="card-location">
                    <%=elt.location%>
                </span>
                <span class="card-data">
                    <%=elt.createdAt%>
                </span>
            </div>


        </div>
    </a>
    <% }) %>




</div>`

const wishlistNav = document.querySelector('.wishlist-nav');
const container = document.querySelector('.profile-main-container');
const profileNavItem = document.querySelectorAll('.profile-nav-item')

wishlistNav.addEventListener('click', (event) => {
    event.preventDefault();
    profileNavItem.forEach(item=>item.classList.remove('active'));
    wishlistNav.classList.add('active')
    fetch('/wishlist')
        .then(res => res.json())
        .then(data => {
            console.log(data)
            for (let item of data) {
                const base64Image = item.images[0].toString("base64");
                item.images = `data:image/jpeg;base64,${base64Image}`;
            }
            const html = ejs.render(gridTemplate, { data })
            container.innerHTML = html;

            const wishlistBtns = document.querySelectorAll('.wishlist-btn');

            wishlistBtns.forEach(btn=>{
                const id = btn.getAttribute('productID')
                btn.addEventListener('click',(event)=>{
                    event.preventDefault();
                    fetch(`/product/wishlist?productID=${id}`).then(()=>wishlistNav.click());
                })

            })


        });


});

