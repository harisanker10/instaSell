const addBtn = document.querySelector("#add-detail");
const container = document.querySelector('.details-input-container');

const imgContainer = document.querySelector('.img-container');
const imgInput = document.querySelector("#formFileMultiple");

const postBtn = document.querySelector('#post-btn');
const form = document.querySelector('#sell-form')

const catInput = document.querySelector('#category-input');
const subCatInput = document.querySelector('#sub-category-input');


let images = [];


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


imgInput.addEventListener('input', (event) => {


    images = event.target.files;
    console.log(images)

    for (let i = 0; i < images.length; i++) {


        const div = document.createElement('div');
        div.classList.add('w-70', 'h-30', 'm-3', 'shadow');
        const img = document.createElement('img');
        img.src = URL.createObjectURL(images[i]);
        img.classList.add('w-100', 'h-100');
        img.style.objectFit = "contain";
        div.append(img.cloneNode('true'));
        imgContainer.append(div.cloneNode('true'));


    }


})


form.addEventListener('submit', async (event) => {

    event.preventDefault();
    const formData = new FormData(form);
    let details = [];
    const detailsArray = document.querySelectorAll(".details-input-container input")

    for (let i = 0; i < detailsArray.length - 1; i += 2) {
        const array = [detailsArray[i].value, detailsArray[i + 1].value]
        details.push(array);
    }
    console.log(details);
    formData.append('details', JSON.stringify(details));
    images = imgInput.files;
    for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
    }

    if(!formData.get('images') || formData.get('images' === '')) {
        window.notify("Add Images");
        return;
    }


    if (formData.get('category') === '' || formData.get('subCategory') === '') {
        window.notify("Enter categories", "5000");
        return;
    }
    console.log(formData)

    try {
        const response = await fetch('/product/post', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            
            window.location.href = '/'

        } else {

            console.log('Request failed:', response.status);
        }
    } catch (err) {
        console.error('Fetch error:', err);
        // Handle the error here
    }



})

catInput.addEventListener('input', async (event) => {
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
})





