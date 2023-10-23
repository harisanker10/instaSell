const mongoose = require('mongoose')
require('dotenv').config();




const connect = () => {
    return mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('DB Connected succesfully');
        const connection = mongoose.connection;
        return {connection}
    })

    .catch((err) => {
        console.log(`Error connecting to DB ${err}`);
    })
}

const getBucket = async()=>{
    const conn = await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
    return {bucket,db}
}

getBucket();

module.exports = { connect,getBucket };




