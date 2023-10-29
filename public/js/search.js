const cardsContainer = document.querySelector(".grid-container");

const datas = document.querySelector(".screen-container");
const userID = datas.getAttribute("userId");
const wishlist = datas.getAttribute("wishlist");
const categoryLi = document.querySelectorAll("strong");

const subCats = document.querySelectorAll(".subCat-filter");

const sortBtns = document.querySelectorAll(".sort-buttons");

const minPriceInput = document.querySelector('#price-min-input')
const maxPriceInput = document.querySelector('#price-max-input')

const state = {};

let locationDetails = localStorage.getItem("locationDetails");
console.log(locationDetails?.lat);

if (locationDetails) {
  console.log(typeof locationDetails);
  console.log(locationDetails?.lon);
  locationDetails = JSON.parse(locationDetails);
} else {
  window.notify("Can't get current location", 8000);
  window.location.reload();
}

state.lat = locationDetails.lat;
state.lon = locationDetails.lon;

state.search = datas.getAttribute("searchParam");

sortBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    state.sort = btn.getAttribute("sort");
    event.preventDefault();
    sortBtns.forEach((btn) => btn.classList.remove("sort-selected"));
    btn.classList.add("sort-selected");
    fetchProducts();
  });
});

subCats.forEach((scat) => {
  scat.addEventListener("mouseover", () => {
    scat.classList.add("text-primary");
  });
  scat.addEventListener("mouseout", () => {
    scat.classList.remove("text-primary");
  });

  scat.addEventListener("click", () => {
    subCats.forEach((scat) => scat.classList.remove("text-highlight"));
    categoryLi.forEach((cat) => cat.classList.remove("text-highlight"));
    scat.classList.add("text-highlight");

    const parent = scat.closest(".category-container");

    const categoryName = parent.querySelector(".category-name");
    categoryName.classList.add("text-highlight");
    const category = categoryName.getAttribute("catId");
    console.log(category);
    state.category = category;
    state.search = "";
    state.subCategory = scat.getAttribute("subCatId");
    
    fetchProducts();
  });
});

categoryLi.forEach((cat) => {
  cat.addEventListener("mouseover", () => {
    cat.classList.add("text-primary");
  });
  cat.addEventListener("mouseout", () => {
    cat.classList.remove("text-primary");
  });

  cat.addEventListener("click", () => {
    subCats.forEach((item) => item.classList.remove("text-highlight"));
    categoryLi.forEach((cat) => cat.classList.remove("text-highlight"));
    cat.classList.add("text-highlight");
    state.category = cat.getAttribute("catId");
    state.subCategory = "";
    state.search = "";
    fetchProducts();
  });
});

const gridTemplate = `
<% products.forEach(elt=> { %>

  <div class="card text-center list-card product-card" id="<%=elt._id%>">


    <% if (!userID || userID !=elt.userID) { %>
      
      <button class="default-black-btn pt-1 wishlist-btn shadow-sm
                      
                      <% if (wishlist && wishlist.includes(elt._id)) { %>
                          active
                      <% } %>
                      
                      " userID="<%=elt.userID %>" id="<%=elt._id%>">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-3 0 30 30" stroke-width="1.5"
          stroke="#000000">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>
      <% } %>

        <div class="img-continer">
          <% if (elt.images) { %>

            <img class="list-card-img" src="<%=elt.images%>" alt="Title">

            <% } %>
        </div>

        <span class="card-price">
          ₹<%=elt.price%>
        </span>
        <span class="card-title ">
          <%=elt.title%>
        </span>
        <div class="d-flex justify-content-between w-100 mt-1 text-muted location-div">

          <p class="card-location m-0">
            <%=elt.location%>
          </p>
          <p class="card-data m-0">
            <%=elt.createdAt%>
          </p>
        </div>


  </div>


  <% }) %>

  `;

function fetchProducts() {
  let url = `/search?`;
  console.log("state", state);

  for (let key in state) {
    url += `${key}=${state[key] ? state[key] : ""}&`;
  }
  console.log(url);
  fetch(url)
    .then((res) => res.json())
    .then((res) => {
      console.log(res);

      const html = ejs.render(gridTemplate, {
        products: res,
        userID: userID,
        wishlist: wishlist,
      });
      cardsContainer.innerHTML = html;
      main();
    })
    .catch((err) => console.log(err));
}

/*
var template = new EJS({
  text: `
    <ul>
      <% for(i = 0; i < the_list.length; i++) { %>
        <li>the_list[i]</li>
      <% } %>
    </ul>
  `
});
var html = template.render({ the_list: data });
document.getElementById('list-wrapper').innerHTML = html;

*/

const main = () => {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const wishlistBtn = card.querySelector(".wishlist-btn");

    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        fetch(
          `/product/wishlist?productID=${wishlistBtn.getAttribute(
            "id"
          )}&userID=${wishlistBtn.getAttribute("userID")}`
        )
          .then((res) => {
            console.log(res);
            if (res.redirected) window.location.href = res.url;
            return res.json();
          })
          .then((res) => {
            if (res.message) {
              window.notify("Added to wishlist");
              wishlistBtn.classList.add("active");
            } else {
              window.notify("Removed from wishlist");
              wishlistBtn.classList.remove("active");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
    card.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = `/product?id=${card.getAttribute("id")}`;
    });
  });
};
main();

const locationMaxInput = document.querySelector("#location-max-input");
const locationSlider = document.querySelector("#customRange1");

locationSlider.addEventListener("mouseup", (event) => {
  console.log(event.target.value);
  state.distance = event.target.value;
  fetchProducts();
});
locationSlider.addEventListener("input", (event) => {
  locationMaxInput.value = event.target.value;
});

locationMaxInput.addEventListener("blur", (event) => {
  locationSlider.value = event.target.value;
  state.distance = event.target.value;
  fetchProducts();
});

minPriceInput.addEventListener('blur',()=>{
  if(!maxPriceInput.value)return;
  state.minPrice = minPriceInput.value;
  state.maxPrice = maxPriceInput.value;
  fetchProducts();
})
maxPriceInput.addEventListener('blur',()=>{
  if(!minPriceInput.value)return;
  state.minPrice = minPriceInput.value;
  state.maxPrice = maxPriceInput.value;
  fetchProducts();
})

console.log(state);
console.log(locationDetails);
