const express = require('express');
const app = express();
const router = require('express').Router();

const multer = require('multer');
const { saveProduct,
    renderProduct,
    renderEdit,
    updateProduct,
    toggleListedStatus,
    addRequest,
    toggleWishlist,
    cancelRequest,
    renderStatus,
    acceptRequest,
    renderCheckout,
    placeOrder,
    getCards,
    renderBuyStatus,
} = require('../controllers/productController');



const { getCategories, getSubCategories } = require('../controllers/categoryController')

const { isAuth } = require('../middleware/isAuth');


const upload = multer({ storage: multer.memoryStorage() });

router.get('/', renderProduct)
router.get('/getCards', getCards);


router.use(isAuth);

router.get('/post', async (req, res) => {
    const categories = await getCategories();
    res.render('sell', { title: 'Sell a product', categories: categories });
})


router.post('/post', upload.array('images'), async (req, res) => {

    console.log('request::::', JSON.parse(req.body.location))
    try {
        const product = req.body;
        product.userID = req.session.userID;
        const data = await saveProduct(product, req.files);
        res.cookie("notify", "Posted successfully.")
        res.status(200).json({ message: 'Added successfully' })
    }
    catch (err) {
        console.log(err);
        err.redirect('/product/post');
        res.cookie("notify", "Something went wrong.")
        res.status(400).json({ message: 'Error adding product' });
        return err;
    }

})

router.post('/update', upload.array('images'), updateProduct)


router.get('/edit', renderEdit)

router.get('/toggleListed', toggleListedStatus);

router.get('/request', addRequest);

router.get('/wishlist', toggleWishlist);

router.get('/cancelRequest', cancelRequest);

router.get('/status', renderStatus);

router.get('/acceptRequest', acceptRequest)

router.get('/checkout', renderCheckout)

router.post('/order', upload.any(),placeOrder)

router.get('/buyStatus',renderBuyStatus)





module.exports = router;

