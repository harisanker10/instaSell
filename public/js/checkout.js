const addressBtn = document.querySelector('.new-address-btn')

const existingAddresses = document.querySelectorAll('.existing-address');

const addressForm = document.querySelector('.new-address-form');
const container = document.querySelector('.content');
const productTitle = container.getAttribute('productName')
const checkoutContainer = document.querySelector('.checkout-container');

const productId = checkoutContainer.getAttribute('productId');
const price = checkoutContainer.getAttribute('price');
const userId = checkoutContainer.getAttribute('userId');


const orderBtn = document.querySelector('#order-btn');

let address;

addressForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(addressForm);
    fetch('/address/add', {
        method: 'POST',
        body: formData
    }).then(res => res.json())
        .then(res => {
            if (res.message) {
                // Sample data
                const { fullname, addressLine, city, state, postalCode, phone, _id } = JSON.parse(res.message);

                console.log(fullname)
                console.log(JSON.parse(res.message))
                console.log(res)
                console.log(res.message.fullname)
                // Create the outer div element
                const addressCard = document.createElement('div');
                addressCard.classList.add('address-card', 'p-2', 'ps-3', 'shadow-sm', 'my-2', 'border', 'existing-address');
                addressCard.setAttribute('addressId', _id);
                address = _id;

                // Create the <h5> element for fullname
                const h5 = document.createElement('h5');
                h5.textContent = fullname;
                addressCard.appendChild(h5);

                // Create <h6> elements for the other fields
                const fieldData = [addressLine, city, state, postalCode, phone];
                fieldData.forEach(data => {
                    const h6 = document.createElement('h6');
                    h6.textContent = data;
                    addressCard.appendChild(h6);
                });

                // Append the addressCard element to the desired container in your document
                container.innerHTML = '';
                container.appendChild(addressCard);
                console.log(address)

            }
        })



})


existingAddresses.forEach(card => {

    card.addEventListener('click', (event) => {
        event.preventDefault();
        address = card.getAttribute('addressid');
        container.innerHTML = '';
        container.append(card)
        console.log(address)


    })
})

orderBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const formData = new FormData();
    if (!address) {
        window.notify("Add address");
        return;
    }
    formData.append('address', address)
    formData.append('productID', productId);
    formData.append('price', price);
    formData.append('sellerID', userId);
    formData.append('productTitle', productTitle);

    console.log(formData);

    fetch('/product/order', {
        method: 'POST',
        body: formData
    }).then(res => {
        console.log(res);
        return res.json()

    }).then(({ url }) => {
        console.log(url);
        window.location.href = url
    })
        .catch(err => console.log(err))

})







