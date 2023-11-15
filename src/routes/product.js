const express = require('express');
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
    addCourier,
    addProduct,
    getOrders,
    getOrderStatus,
    downloadOrderDetails
} = require('../controllers/productController');



const { getCategories, getSubCategories } = require('../controllers/categoryController')

const { isAuth } = require('../middleware/isAuth');


const upload = multer({ storage: multer.memoryStorage() });

router.get('/', renderProduct)


router.use(isAuth);

router.get('/post', async (req, res) => {
    const categories = await getCategories();
    res.render('sell', { title: 'Sell a product', categories: categories });
})


router.post('/post', upload.array('images'), addProduct)

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

router.get('/buyStatus',renderBuyStatus);

router.post('/courier',upload.any(),addCourier)

router.get('/getOrders',getOrders)

router.get('/getCourierStatus',getOrderStatus)

router.get('/order/download',downloadOrderDetails)





module.exports = router;

