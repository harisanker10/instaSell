// require('dotenv').config();
// const mongoose = require('mongoose')




// const connect = () => {
//     return mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('DB Connected succesfully');
//         const connection = mongoose.connection;
//         return {connection}
//     })

//     .catch((err) => {
//         console.log(`Error connecting to DB ${err}`);
//     })
// }

// const getBucket = async()=>{
//     const conn = await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     const db = mongoose.connection.db
//     const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
//     return {bucket,db}
// }

// getBucket();

// module.exports = { connect,getBucket };



require('dotenv').config();
const mongoose = require('mongoose');

const connect = () => {
    return mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        return mongoose.connection; // Return the connection object
    })
    .catch((err) => {
        console.error(`Error connecting to DB: ${err}`);
        throw err; // Rethrow the error for higher-level handling
    });
};

const getBucket = async () => {
    try {
        await connect(); // Ensure we're connected before accessing the bucket
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
        return { bucket, db };
    } catch (err) {
        console.error(`Error while getting bucket: ${err}`);
        throw err; // Rethrow the error for higher-level handling
    }
};

mongoose.connection.on('connected', () => {
    console.log('DB Connected successfully');
});

module.exports = { connect, getBucket };


