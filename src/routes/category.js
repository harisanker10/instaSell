const express = require('express');
const app = express();
const router = require('express').Router();
const mongoose = require('mongoose');
const {SubCategory} = require('../models/category');
const bodyParser = require('body-parser')

const {addCategory, addSubCategory,getCategories,getSubCategories,deleteCategory,deleteSubCategory} = require('../controllers/categoryController')


app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', async(req, res) => {
    const categories = await getCategories();
    res.status(200).send({message:categories});
})

router.post('/',async(req,res,next)=>{
    try{

        const data = await addCategory(req.body.name);
        res.cookie("notify","Added successfully");
        res.redirect('/user/profile?nav=add');
    }catch(err){
        next(err);
    }
        

})
router.post('/subcategory',async(req,res,next)=>{
try{

    const {category,subCategory} = req.body;
    const data = await addSubCategory(category,subCategory);
    res.cookie("notify","Added successfully");
    res.redirect('/user/profile?nav=add');
}catch(err){
     next(err);
}
})

router.get('/subcategory/:id',async(req,res,next)=>{

    
    const subCategories = await getSubCategories(req.params.id);
    res.cookie("notify","Added successfully");
    res.status(200).send({message:subCategories});

})

router.get('/delete',async(req,res,next)=>{
    try{

        if(req.query.subCategory === 'all'){
            const data = await deleteCategory(req.query.category);
            console.log(data)
    }else{
        const data = await deleteSubCategory(req.query.subCategory);
        console.log(data)
    }
    
    res.cookie("notify","Deleted successfully");
    res.redirect('/user/profile?nav=add');
}catch(err){
    next(err);
}
    

})



module.exports = router;

