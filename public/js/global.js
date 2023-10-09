document.addEventListener('DOMContentLoaded', async () => {

    const locationBtn = document.querySelector('#location-btn');
    let locationDetails = JSON.parse( localStorage.getItem('locationDetails'));
    console.log(locationDetails);
    if (locationDetails) {
        console.log('true')
        console.log(locationDetails.suburb);
        locationBtn.innerHTML = locationDetails.suburb;
        return;
    }
    
    else {
        console.log('false')

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            console.log('latitude', latitude);
            console.log('longitude', longitude);

            const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`;




            fetch(url) // Use the variable 'url' here, not a string 'url'
                .then((res) => res.json()) // Parse the response as JSON
                .then((data) => {
                    console.log(data)
                    console.table(data.features[0].properties);
                    locationDetails = data.features[0].properties;
                    locationBtn.innerHTML = data.features[0].properties.suburb;
                    localStorage.setItem('locationDetails', JSON.stringify(locationDetails));

                })
                .catch((error) => {
                    // Handle any errors that occur during the fetch
                    console.error('Fetch error:', error);
                });


        });
    }
    })

    
// });
