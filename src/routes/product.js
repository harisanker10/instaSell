const express = require('express');
const app = express();
const router = require('express').Router();

const multer = require('multer');
const { saveProduct } = require('../controllers/productController');
const { getCategories, getSubCategories } = require('../controllers/categoryController')

const { isAuth } = require('../middleware/isAuth');


const upload = multer({ storage: multer.memoryStorage() });



router.get('/post', isAuth, async (req, res) => {
    const categories = await getCategories();
    res.render('sell', { title: 'Sell a product', categories: categories });
})


router.post('/post', isAuth, upload.array('images'), async (req, res) => {
    try {
        const product = req.body;
        product.userID = req.session.userID;
        const data = await saveProduct(product, req.files);
        res.status(200).json({ message: "Successfully added product" })

    }
    catch (err) {
        console.log(err);
        err.redirect('/product/post');
        return err;
    }

})





module.exports = router;

