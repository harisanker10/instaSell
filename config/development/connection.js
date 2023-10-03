const mongoose = require('mongoose')
require('dotenv').config();


let db, bucket, connection;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('DB Connected succesfully');
        connection = mongoose.connection;
        // db = mongoose.connection.db;
        // bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
    })
       
    .catch((err) => {
        console.log(`Error connecting to DB ${err}`);
    })

module.exports = { connection, bucket};




