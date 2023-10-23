const getLocationBtn = document.querySelector('#get-location-btn');
const locationInput = document.querySelector('#sell-form-location')

const initialLocationValue = locationInput.value;


getLocationBtn.addEventListener('click',(event)=>{
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
                    name : data.features[0].properties?.suburb || data.features[0].properties?.city,
                    city : data.features[0].properties?.city,
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


locationInput.addEventListener('blur',(event)=>{
    const name = event.target.value;
    let locationAddress = name.split(/[\s,]+/);
    locationAddress = locationAddress.join('%20') + '%20india';
    const url = `https://api.geoapify.com/v1/geocode/search?text=${locationAddress}&format=json&apiKey=5b8cbdeeff9f48a7be8492329512e1e8`

   
        fetch(url)
        .then(res=>res.json())
        .then(data=>{
            
            const locationDetails = data.results[0]

            console.log(locationDetails)

            locationInput.value = `${event.target.value}, ${locationDetails?.city}, ${locationDetails?.state_district.split(' ')[0]}, ${locationDetails?.state}`;
            if(locationInput.value.includes('undefined'))locationInput.value = '';
            locationData = {
                name: name,
                city: locationDetails.city,
                lat: locationDetails.lat,
                lon: locationDetails.lon
            }

            console.log(locationData)
        })
        .catch(err=>{
            console.log(err);
            locationInput.value = '';
            window.notify("Try a different location")
        })

   
})
