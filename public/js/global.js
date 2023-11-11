
let locationInitialVal = '';
document.addEventListener('DOMContentLoaded', async () => {

    const locationBtn = document.querySelector('#location-btn');

    locationBtn.addEventListener('blur', (event) => {
        window.loadingOn();
        const name = event.target.value;
        if(name.trim() === ''){
            locationBtn.value = locationInitialVal;
            window.loadingOff();
            return;
        } 


        let locationAddress = name.split(/[\s,]+/);
        locationAddress = locationAddress.join('%20') + '%20india';

        const url = `https://api.geoapify.com/v1/geocode/search?text=${locationAddress}&format=json&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`

        console.log(url)
        fetch(url)
            .then(res => res.json())
            .then(data => {

                const locationDetails = data.results[0]

                console.log(locationDetails)

                locationBtn.value = locationDetails.suburb || locationDetails?.city || locationDetails?.state;
                localStorage.setItem('locationDetails', JSON.stringify(locationDetails));
                window.location.reload()

                if (locationBtn.value.includes('undefined')) locationBtn.value = '';

            })
            .catch(err => {
                console.log(err);
                locationBtn.value = '';
                window.notify("Try a different location")
            })



    })

    locationBtn.addEventListener('click', (event) => {
        locationInitialVal = event.target.value;
        locationBtn.value = '';
    })


    let locationDetails = JSON.parse(localStorage.getItem('locationDetails'));
    if (locationDetails) {
        locationBtn.value = locationDetails?.suburb || locationDetails?.city || locationDetails?.state;
        return;
    } else {

        navigator.geolocation.getCurrentPosition((position) => {
            window.loadingOn();
            const { latitude, longitude } = position.coords;
            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`;




            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    locationDetails = data.features[0].properties;
                    if (data.features[0].properties.suburb)
                        locationBtn.value = data.features[0].properties.suburb;
                    else
                        locationBtn.value = data.features[0].properties.city;
                    localStorage.setItem('locationDetails', JSON.stringify(locationDetails));
                    window.location.reload()
                    
                    
                })
                .catch((error) => {
                    console.error('Fetch error:', error);
                    window.location.reload()
                });


        });




    }


















})

const onClickBtns = document.querySelectorAll('.on-click-btn');
onClickBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        const link = btn.getAttribute('navLink');
        if (link) {
            event.preventDefault();
            window.location.href = btn.getAttribute('navLink');
        }
    })
})






