const bufferToURI = (buffer)=>{

    const base64Image = buffer.toString('base64');
    const dataURI = `data:image/jpeg:${base64Image}`;
    return dataURI;
}
module.exports = bufferToURI;