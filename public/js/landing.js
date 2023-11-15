
const cards = document.querySelectorAll('.product-card');


const animate = ()=>{
    cards.forEach(card=>{
        card.classList.add('animate')
    })
}


const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
        }
    });
});
const heading = document.querySelector('.trending-products-heading');
observer.observe(heading);




  