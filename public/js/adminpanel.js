
import { usersMain } from '/js/users.js'
const profileNavItem = document.querySelectorAll(".profile-nav-item");
console.log(profileNavItem)
const mainContainer = document.querySelector('#profile-main-container');

const [analyticsNav, usersNav, addNav, ordersNav, settingsNav] = profileNavItem;
const container = document.querySelector('#content-container');


profileNavItem.forEach(item => {

    item.addEventListener('click', (event) => {
        event.preventDefault();
        const nav = item.getAttribute('nav');
        profileNavItem.forEach(item => item.classList.remove('active'));
        item.classList.add('active');
        fetch(`/adminpanel?nav=${nav}`)
            .then(res => res.json())
            .then(res => {

                switch(nav){
                    case 'users':{
                        renderUsers(res)
                        break;
                    }
                    case 'add':{
                        renderAdd(res);
                        break;
                    }
                    case 'orders':{
                        renderOrders(res);
                    }
                    default:{
                        console.log('cant get data',nav);
                        break
                    }
                    
                }

            })
    })
})


const renderUsers = (data) => {

    const usersTemplate = `<div id="users-section" class="d-flex flex-column w-100 p-5 py-0 align-items-center" over>

<table class="table table-strrped">
    <thead>
        <tr>

            <th class="text-center" scope="col">Username</th>
            <th class="text-center" scope="col">Email</th>
            <th class="text-center" scope="col">Phone</th>
            <th class="text-center" scope="col">Joined</th>
            <th class="text-center" scope="col">Block</th>
        </tr>
    </thead>

    <tbody class="table-body">
        <% data.users.forEach(element=> { %>



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


            <% }) %>
    </tbody>
</table>

<prev class="d-flex w-75 justify-content-between" >
   <button class="outline-black-btn shadow-sm px-2" style="background-color: gainsboro; border: 1px solid gray;" id="prev">Prev</button>
<button class="outline-black-btn shadow-sm px-2" style="background-color: gainsboro; border: 1px solid gray;" id="home">Home</button>
<button class="outline-black-btn shadow-sm px-2" style="background-color: gainsboro; border: 1px solid gray;" id="next">Next</button>
</div>
</div>
<script src="/js/users.js" defer></script>`

    const html = ejs.render(usersTemplate, { data });
    container.innerHTML = html;
    usersMain()
}

const renderAdd = (data) => {
    const addTemplate = `<div id="add-section" class="">

    <h4 class="ms-4 mt-4">Create Category</h4>
    
    <form action="/category" method="post" class="d-flex-col  p-4 pt-2 mt-2">
        <div class="w-100">
            <input id="create-category" type="text" name="name"
                class="form-control w-50 ms-0 mt-0 m-1" required>
            <button class="outline-black-btn h-60 " id="create-category"
                type="submit">Create</button>
        </div>


    </form>

    <hr>
    <h4 class="ms-4 mt-4">Create Sub Category</h4>

    <form action="/category/subcategory" method="post" class="d-flex-col  p-4 pt-2 mt-2">
        <div class=" w-100">

            <select name="category" class="form-select w-50 " aria-label="Default select example"
                required>
                <option selected disabled>Select Category</option>

                <% data.categories.forEach(element=> { %>

                    <option value="<%= element._id%>">
                        <%= element.name %>
                    </option>
                    <% }) %>



            </select>
            <input id="create-category-input" name="subCategory" type="text"
                class="form-control ms-0 m-1 w-50" required>
            <button id="create-category" type="submit"
                class="outline-black-btn h-60">Create</button>
        </div>


    </form>
    <hr>
    <h4 class="ms-4 mt-4">Delete a Category or Sub Category</h4>
    <form action="/category/delete" class="d-flex-col p-4 pt-2 mt-2">
        <div class=" w-100">

            <select id="delete-cat-input" class="form-select w-50 mb-1 "
                aria-label="Default select example" name="category" required>
                
                <% data.categories.forEach(element=> { %>
                    
                    <option value="<%= element._id%>">
                        <%= element.name %>
                    </option>
                    <% }) %>
                    
                    
                    
                </select>
                <select id="delete-SubCat-input" name="subCategory" class="form-select w-50 mb-1"
                aria-label="Default select example"  required>
                
                <option selected value="all" >Entire Category</option>



            </select>
            <button id="delete-category" type="submit"
                class="outline-black-btn h-60">Delete</button>
        </div>


    </form>

</div>`

const html = ejs.render(addTemplate, { data })
container.innerHTML = html;
categoryJS();

}

const renderOrders = (data)=>{
    const orderTemplate = `
    <table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Product Title</th>
          <th scope="col">Buyer</th>
          <th scope="col">Seller</th>
          <th scope="col">List Price</th>
          <th scope="col">Transaction Amount</th>
          <th scope="col">Profit</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
      <% orders.forEach(order=>{ %>
    
          <tr>
          <td><%=order.productID.title%></td>
          <td><%=order.buyerID.firstName%></td>
          <td><%=order.sellerID.firstName%></td>
          <td><%=order.productID.price%></td>
          <td><%=order.price.totalPrice%></td>
          <td><%=order.price.totalPrice - order.price.listPrice %></td>
          <td><%=order.status %></td>
          </tr>
        <%})%>
        
      </tbody>
    </table>
    `
    const html = ejs.render(orderTemplate,{orders:data})
    container.innerHTML = html; 
}

// const addNav = document.querySelector('#add-nav')



const orderBtn = document.querySelector('.orders');

const categoryJS = () => {


    const deleteCatBtn = document.querySelector('#delete-category');
    const deleteCatInput = document.querySelector('#delete-cat-input');
    const deleteSubCatInput = document.querySelector('#delete-SubCat-input');






    deleteCatInput.addEventListener('input', (event) => {
        console.log('fetchingg')
        deleteSubCatInput.innerHTML = '';
        const allOption = document.createElement('option')
        allOption.setAttribute('value', 'all')
        allOption.innerHTML = 'Entire category';
        deleteSubCatInput.append(allOption);
        console.log({ category: event.target.value })
        console.log(deleteCatInput.value);


        fetch(`/category/subcategory/${event.target.value}`, {
            method: 'GET', // Use GET method
        })
            .then((res) => res.json()) // Parse the response as JSON
            .then((data) => {
                // Access the 'message' property from the response data
                console.log(data.message);
                console.log(data);

                (data.message).forEach((elt) => {
                    const option = document.createElement('option');
                    option.setAttribute('value', elt._id);
                    option.innerHTML = elt.name;
                    deleteSubCatInput.append(option);
                })


            })
            .catch((error) => {
                // Handle any errors that occur during the fetch
                console.error('Fetch error:', error);
            });

    })
}



usersNav.click()


// orderBtn.addEventListener('click', (event) => {

//     console.log('elon ma')
//     fetch('/product/getOrders')
//         .then(res => res.json())
//         .then((res) => {
//             console.dir(res)
//             const html = ejs.render(orderTemplate, { orders: res });
//             mainContainer.innerHTML = html;
//         })
// })