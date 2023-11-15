
const addressBtn = document.querySelector('.new-address-btn')

const existingAddresses = document.querySelectorAll('.existing-address');

const addressForm = document.querySelector('.new-address-form');
const container = document.querySelector('.address-content');
const productTitle = container.getAttribute('productName')
const checkoutContainer = document.querySelector('.checkout-container');

const productId = checkoutContainer.getAttribute('productId');
const price = checkoutContainer.getAttribute('price');
const userId = checkoutContainer.getAttribute('userId');

const spinner = document.querySelector('.spinner-border');

const paymentVerifyIcon = document.querySelector('#payment-verify-icon')
const addressVerifyIcon = document.querySelector('#address-verify-icon')

const paymentMethods = document.querySelectorAll('.payment-card')

const orderBtn = document.querySelector('#order-btn');

let address;
let paymentMethod;

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
        card.style.backgroundColor = '#a3a3a3'
        addressVerifyIcon.classList.remove('hide');
        console.log(address)


    })
})

console.log('----------------------------', price, balance)

orderBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (!address) {
        window.notify("Add address", 10000, 'err');
        return;
    }
    if (!paymentMethod) {
        window.notify("Select payment method", 10000, 'err');
        return;
    }

    console.log("Payment method:::::::::", paymentMethod)

    if (paymentMethod === 'wallet') {

        if (parseFloat(balance) < parseFloat(price)) {
            window.notify("Not enough wallet balance", 10000, 'err')
            return;
        }

    }




    const formData = new FormData();
    formData.append('address', address)
    formData.append('productID', productId);
    formData.append('price', price);
    formData.append('sellerID', userId);
    formData.append('productTitle', productTitle);
    formData.append('paymentMethod', paymentMethod)

    console.log(formData);
    spinner.classList.remove('hide');
    orderBtn.style.backgroundColor = 'gray'

    fetch('/product/order', {
        method: 'POST',
        body: formData
    }).then(res => {
        console.log(res);
        return res.json()

    }).then(({ url }) => {
        if (paymentMethod === 'wallet') {
            window.loacation.href = `/product/buyStatus?id=${productId}`
            return;
        }
        console.log(url);
        window.location.href = url
    })
        .catch(err => console.log(err))

})

paymentMethods.forEach(card => {
    card.addEventListener('click', () => {
        paymentMethods.forEach(card => { card.style.backgroundColor = "#ffffff" })
        card.style.backgroundColor = '#a3a3a3'
        paymentVerifyIcon.classList.remove('hide')
        paymentMethod = card.getAttribute('id');
    })
})







