const express = require('express');
const app = express();
const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const upload = multer();

const {getAddress,addAddress} = require('../controllers/addressController');


router.post('/add',upload.none(),asyncHandler(async(req,res)=>{
        console.log(req.body)
        const data = await addAddress(req.body,req.session.userID);
        console.log(data);
        res.status(200).json({message:JSON.stringify(data)});
    }))


module.exports = router;