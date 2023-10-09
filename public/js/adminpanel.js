const analyticsContainer = document.querySelector('#analytics-section')
const usersContainer = document.querySelector('#users-section')
const addContainer = document.querySelector('#add-section')
const settingsContainer = document.querySelector('#settings-section')

const containers = [analyticsContainer,usersContainer,addContainer,settingsContainer]

const profileNavItem = document.querySelectorAll(".profile-nav-item");





const addNav = document.querySelector('#add-nav')
const container = document.querySelector('#content-container');

console.log(addNav, container)

addNav.addEventListener('click', () => {

addContainer.classList.remove('hide');    

})



const deleteCatBtn = document.querySelector('#delete-category');
const deleteCatInput = document.querySelector('#delete-cat-input');
const deleteSubCatInput = document.querySelector('#delete-SubCat-input');



if(deleteCatBtn){

deleteCatInput.addEventListener('input', (event) => {
    deleteSubCatInput.innerHTML = '';
    const allOption = document.createElement('option')
    allOption.setAttribute('value','all')
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
            
            (data.message).forEach((elt)=>{
                const option = document.createElement('option');
                option.setAttribute('value',elt._id);
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


const blockUserBtn = document.querySelector("#block-user-btn");
