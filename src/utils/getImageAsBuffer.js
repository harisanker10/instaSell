const axios = require('axios');

async function getImageAsBuffer(imageURL){

    try{
        const response = await axios.get(imageURL,{
            responseType: 'arraybuffer',
        });

        const data = response.data;
        contentType = response.headers['content-type']
        return imageBuffer = {
            data: data,
            contentType: contentType
        };
        
        
    }
    catch(error){
        console.log(`Error fetching image: ${error}`);
        
    }


}



module.exports = getImageAsBuffer;