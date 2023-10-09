const mongoose = require('mongoose');
const Product = require('../models/product');
const convertISODate = require('../utils/formatDate')

let db, bucket;

mongoose.connection.on('connected', () => {
    db = mongoose.connection.db;
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
})

const saveProduct = async (item, images) => {


    const imageIDs = await saveImgs(images);
    try {

        const product = new Product({
            title: item.title,
            category: item.category,
            subCategory: item.subCategory,
            location: item.location,
            price: item.price,
            description: item.description,
            details: JSON.parse(item.details),
            images: imageIDs,
            userID: item.userID
        })


        const data = await product.save();
    } catch (err) {
        return err;
    }

}

const saveImgs = async (files) => {                                      //returns an array of IDs of images after saving


    const imageIds = [];

    for (const file of files) {
        try {
            const uploadStream = await bucket.openUploadStream(file.originalname);
            const res = await uploadStream.end(file.buffer);
            imageIds.push(res.id);
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }

    console.log(imageIds);
    return imageIds;



}


async function getImages(imageIDs) {

    // const imageData = await Image.find({ email: email })



    const images = await Promise.all([...imageIDs].map(async (id) => {


        let chunks = [];
        const downloadStream = await bucket.openDownloadStream(id);

        return new Promise((resolve, reject) => {

            downloadStream.on('data', (chunk) => {
                chunks.push(chunk);
            })

            downloadStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            })
        });
    }))

    return images;
}


const getProductCards = async (id) => {
    let products;
    if (id) { products = await Product.find({ userID: id }, { images: 1, price: 1, title: 1, location: 1, createdAt: 1 }).lean(); }
    else { products = await Product.find({}, { images: 1, price: 1, title: 1, location: 1, createdAt: 1 }).lean() }
    for (let product of products) {
        product.images = await getImages(product.images)
        product.createdAt = convertISODate(product.createdAt)
    }

    return products;


}

module.exports = { saveProduct, saveImgs, getProductCards, getImages };



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