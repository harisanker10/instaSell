const profileNavItem = document.querySelectorAll(".profile-nav-item");

profileNavItem.forEach((item)=>{
    item.addEventListener('click',()=>{
        profileNavItem.forEach((item)=>[
            item.classList.remove('active')
        ]);
        item.classList.add('active');
    })
})