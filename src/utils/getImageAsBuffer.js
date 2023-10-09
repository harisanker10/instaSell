const axios = require('axios');

async function getImageAsBuffer(imageURL) {
  if(!imageURL)return;
  try {
    const response = await axios.get(imageURL, {
      responseType: 'arraybuffer',
    });

    const data = Buffer.from(response.data); // Use Buffer.from to convert arraybuffer to Buffer
    const contentType = response.headers['content-type'];

    return {
      data: data,
      contentType: contentType,
    };
  } catch (error) {
    console.log(`Error fetching image: ${error}`);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

module.exports = getImageAsBuffer;
