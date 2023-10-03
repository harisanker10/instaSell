const mongoose = require('mongoose');
const Product = require('../models/product');

const saveProduct = async (item,images,bucket) => {

    const product = new Product({
        title: item.title,
        category: item.category,
        subCategory: item.subCategory,
        loaction: item.loaction,
        price: item.price,
        description: item.description,
        details: item.details,
        images: saveImgs(images,bucket)

    })



}

const saveImgs = async (files,bucket) => {                                      //returns an array of IDs of images after saving

    for (let i = 0; i < files.length; i++) {

        const uploadStream = await bucket.openUploadStream(files[i].originalname);
        await uploadStream.end(files[i].buffer)

        uploadStream.on('finish', async () => {
            console.log('file saved successfully');
            let array = await bucket.find({ filename: files[i].originalname }).toArray();
            console.log(array);
            let imageID = [];
            for(let obj of array){
                imageID.push(obj._id);
            }

            return imageID;

        
        })
    }

}



module.exports = {saveImgs};



/*




    const uploadStream = await bucket.openUploadStream(filename);

    await uploadStream.end(fileBuffer);

    uploadStream.on('finish', async () =>{
        
        console.log("file saved successfully")
        
        let array = await bucket.find({ filename: filename }).toArray();
        
        const obj = array[0];
        console.log(obj)
        console.log(array)
        const img = new Image({
            accountName: req.session.fullName,
            email: req.session.emailID,
            image_id: obj._id,
            tags: req.body.tags
        })
    
        await img.save();
        

    }) 





*/