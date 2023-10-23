const addBtn = document.querySelector("#add-detail");
const container = document.querySelector('.details-input-container');

const imgContainer = document.querySelector('.img-container');
const imgInput = document.querySelector("#formFileMultiple");

const postBtn = document.querySelector('#post-btn');
const form = document.querySelector('#sell-form')

const catInput = document.querySelector('#category-input');
const subCatInput = document.querySelector('#sub-category-input');

const productID = form.getAttribute('productID');

const getLocationBtn = document.querySelector('#get-location-btn');
const locationInput = document.querySelector('#sell-form-location')

const initialLocationValue = locationInput.value;

let locationData;




const getSubCat = async (event) => {
    subCatInput.innerHTML = '';
    console.log({ category: event.target.value })
    console.log(catInput.value);

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
                console.log(option)
                subCatInput.append(option);
            })


        })
        .catch((error) => {
            // Handle any errors that occur during the fetch
            console.error('Fetch error:', error);
        });
}

const addDetail = () => {
    const div = document.createElement('div');
    div.classList.add('input-group');
    const innerDiv = document.createElement('div');
    innerDiv.classList.add('mb-1', 'w-50')
    const input = document.createElement('input')
    input.classList.add('form-control')
    input.setAttribute('type', 'text');
    innerDiv.append(input);
    div.append(innerDiv.cloneNode(true));
    div.append(innerDiv.cloneNode(true));
    container.append(div);
}

addBtn.addEventListener('click', () => {
    console.log('clicked')
    addDetail()
});

const imgDeleteBtns = document.querySelectorAll(".delete-img-btn");

let imageData = [];

imgDeleteBtns.forEach((btn) => {


    btn.addEventListener('click', (event) => {
        let container = event.target.closest('.img-frame');
        console.log(container);
        console.log(container.innerHTML);
        container.remove();
        imageData.push(parseInt(btn.getAttribute('index')));
        console.log(imageData)
    })
})

catInput.addEventListener('input', getSubCat)
catInput.addEventListener('DOMContentLoaded', getSubCat)



imgInput.addEventListener('input', (event) => {


    images = event.target.files;
    console.log(images)

    for (let i = 0; i < images.length; i++) {


        const div = document.createElement('div');
        div.classList.add('my-1', 'img-frame');
        const img = document.createElement('img');
        img.src = URL.createObjectURL(images[i]);
        img.classList.add('w-100', 'h-100');
        img.style.objectFit = "contain";
        div.append(img.cloneNode('true'));
        imgContainer.append(div.cloneNode('true'));


    }


})

form.addEventListener('submit', (event) => {
    event.preventDefault();
    let formdata = new FormData(form);
    formdata.append('imgRemoveData', JSON.stringify(imageData));
    let images = imgInput.files;
    for (let i = 0; i < images.length; i++) {
        formdata.append('images', images[i]);
    }

    let details = [];
    const detailsArray = document.querySelectorAll(".details-input-container input")

    for (let i = 0; i < detailsArray.length - 1; i += 2) {
        const array = [detailsArray[i].value, detailsArray[i + 1].value]
        details.push(array);
    }

    formdata.append('details', JSON.stringify(details));

    formdata.delete('location');
    if (initialLocationValue !== locationInput.value) {
        formdata.append('location', JSON.stringify(locationData));
    }

    fetch(`/product/update?productID=${productID}`, {
        method: 'POST',
        body: formdata
    })
        .then(res => {
            if (res.status === 200) {
                window.location.href = '/profile?nav=listings';
            }
        })
        .catch(err => {
            console.log(err);
        })



    console.log(formdata);
})



getLocationBtn.addEventListener('click', (event) => {
    event.preventDefault();
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log('latitude', latitude);
        console.log('longitude', longitude);

        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`;




        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                locationInput.value = data.features[0].properties.city;

                locationData = {
                    name: data.features[0].properties?.suburb || data.features[0].properties?.city,
                    city: data.features[0].properties?.city,
                    lat: data.features[0].properties?.lat,
                    lon: data.features[0].properties?.lon
                }
                console.log(locationData)


            })
            .catch((error) => {
                window.notify('Something went wrong while adding location. Try again.')
                console.error('Fetch error:', error);
            });


    });
})


locationInput.addEventListener('blur', (event) => {
    const name = event.target.value;
    let locationAddress = name.split(/[\s,]+/);
    locationAddress = locationAddress.join('%20') + '%20india';
    const url = `https://api.geoapify.com/v1/geocode/search?text=${locationAddress}&format=json&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`


    fetch(url)
        .then(res => res.json())
        .then(data => {

            const locationDetails = data.results[0]

            console.log(locationDetails)

            locationInput.value = `${event.target.value}, ${locationDetails?.city}, ${locationDetails?.state}`;
            if (locationInput.value.includes('undefined')) locationInput.value = '';
            locationData = {
                name: name,
                city: locationDetails.city,
                lat: locationDetails.lat,
                lon: locationDetails.lon
            }

            console.log(locationData)
        })
        .catch(err => {
            console.log(err);
            locationInput.value = '';
            window.notify("Try a different location")
        })


})
