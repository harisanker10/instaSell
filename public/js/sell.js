const axios = require('axios');
console.log(axios);

const addBtn = document.querySelector("#add-detail");
const container = document.querySelector('.details-input-container');

const imgContainer = document.querySelector('.img-container');
const imgInput = document.querySelector("#formFileMultiple");

const postBtn = document.querySelector('#post-btn');
const form = document.querySelector('#sell-form')

let images;


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
    const details = [];

    const detailsArray = document.querySelectorAll(".details-input-container input")
    for (let i = 0; i < detailsArray.length-1; i += 2) {
        const key = detailsArray[i].value;
        const value = detailsArray[i+1].value;
        const obj = {[key]:value}
        details.push(obj);
        // details[detailsArray[i].value] = detailsArray[i+1].value;
    }
    console.log(details);
    formData.append('details',JSON.stringify(details))
    
    for(let i=0; i<images.length; i++){
        formData.append('images',images[i]);
    }
    
    console.log(formData);

    try{
        axios.post('/product/post',formData).then((data)=>console.log(data,'done'));

    }
    catch(err){
        console.log(err);
    }



})





