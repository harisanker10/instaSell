const express = require('express');
const app = express();
const { addUser, checkUserExist, authUser, getUser } = require('../controllers/userController');
const router = require('express').Router();

const bodyParser = require('body-parser')
const multer = require('multer');

const mongoose = require('mongoose')

mongoose.connection.on('connected',()=>{
    db = mongoose.connection.db;
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
})


const { saveImgs } = require('../controllers/productController');


app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

router.get('/post', (req, res) => {
    res.render('sell', { title: 'Sell a product' })
})


router.post('/post', upload.array('images'), async (req, res) => {
    console.log('posting..');
    try {
        console.log(req.body)
        console.log(req.files)
        console.log(bucket)
        // await saveProduct(req.body,req.files, bucket);
        res.status(200).json({ message: 'successful' });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Internal error while saving' });
    }

})


module.exports = router;

