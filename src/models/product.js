const { connect, getBucket } = require('../../config/development/connection');
const mongoose = require('mongoose');
const convertISODate = require('../utils/formatDate');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.mongo.ObjectId,
        required: true
    },
    subCategory: {
        type: mongoose.mongo.ObjectId,
        required: true
    },
    location: {
        name: {type:String,required:true},
        city:{type:String,required:true},
        lat: {type:Number,required:true},
        lon: {type:Number,required:true}
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    details: [
        [
            String, String
        ]
    ],
    images: {
        type: [mongoose.mongo.ObjectId],
        ref: 'images.files'
    },

    userID: {
        type: mongoose.mongo.ObjectId,
        required: true,
        ref: 'User'
    },

    isListed: {
        type: Boolean,
        default: true
    }



}, { timestamps: true })



async function getImages(imageIDs) {
    const { bucket, db } = await getBucket();

    const images = await Promise.all([...imageIDs].map(async (id) => {
        let chunks = [];

        const downloadStream = await bucket.openDownloadStream(id);

        return new Promise((resolve, reject) => {
            downloadStream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            downloadStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });

            downloadStream.on('error', (error) => {
                // Handle the error gracefully
                reject(error);
            });
        });
    }));

    return images;
}




productSchema.statics.getFullProduct = async function (productID) {

    const product = await this.findOne({ _id: productID }).lean();
    product.images = await getImages(product.images);
    product.createdAt = convertISODate(product.createdAt)
    product.updatedAtAt = convertISODate(product.updatedAt)
    product.location = product.location.name;

    return product;


}


productSchema.statics.toggleListedStatus = async function (productID) {

    try {

        const product = await this.findOne({ _id: productID });
        if (product.isListed) product.isListed = false;
        else product.isListed = true;
        const res = await product.save();
        return res;

    } catch (err) {
        return err;
    }


}




productSchema.statics.getProductCards = async function (userID, category, subCategory) {


    let conditions = {};
    if (userID) conditions.userID = userID
    if (category) conditions.category = new mongoose.mongo.ObjectId(category)
    if (subCategory) conditions.subCategory = new mongoose.mongo.ObjectId(subCategory)
    console.log('conditions:;;;;;', conditions)
    const products = await this.aggregate([
        {
            $match: conditions
        },
        {
            $project: {
                images: { $arrayElemAt: ['$images', 0] },
                price: 1,
                title: 1,
                location: 1,
                createdAt: 1,
                userID:1
            }
        }
    ]);


    for (let product of products) {
        product.images = await getImages([product.images])
        product.createdAt = convertISODate(product.createdAt)
        product.location = product.location.name;
    }
    console.log('length::::::::::', products.length)
    return products;


}






productSchema.statics.searchProductCards = async function (searchQuery) {


    const products = await this.aggregate([
        {
            $match: {
                $and: [
                    {
                        isListed: true
                    },
                    {
                        $or: [
                            { title: { $regex: searchQuery, $options: 'i' } },
                            { details: { $regex: searchQuery, $options: 'i' } },
                            { category: { $regex: searchQuery, $options: 'i' } },
                            { subCategory: { $regex: searchQuery, $options: 'i' } }
                        ]
                    }
                ]
            }

        },
        {
            $project: {
                images: { $arrayElemAt: ['$images', 0] },
                price: 1,
                title: 1,
                location: 1,
                createdAt: 1,
                userID: 1
            }
        }
    ])

    productPromises = products.map(async (product) => {
        product.images = await getImages([product.images])
        product.createdAt = convertISODate(product.createdAt)
        product.location = product.location.name;
        return product;
    })

    const formatedProducts = Promise.all(productPromises)
    return formatedProducts;
}
const product = mongoose.model('Product', productSchema);



module.exports = product;