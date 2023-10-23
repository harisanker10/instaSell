const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { isAuth } = require('../middleware/isAuth')
const { registerUser,
    loginUser,
    getUser,
    blockUser,
    unBlockUser,
    updateUser,
    getProfileNavData,
    renderProfile,
    addAddress,
    renderEditProfile,
    deleteAddress,
    renderProfileView,

} = require('../controllers/userController');


const { getProductCards, renderSearch, renderLanding } = require('../controllers/productController')


router.get('/', renderLanding)


router.get('/login', (req, res) => {
    if (req.session.userID) res.redirect('/');
    res.render('login', { title: 'Log In' })
});

router.get('/search', renderSearch)

router.post('/login', upload.any(), loginUser);



router.get('/signup', (req, res, err) => {
    if (req.session.username) res.redirect('/');
    res.render('signup.ejs', { title: 'Register' });
})


router.post('/signup', upload.any(), registerUser);

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})



router.get('/profile', isAuth, renderProfile)

router.get('/adminpanel', renderProfile);

router.get('/viewProfile', renderProfileView);

router.get('/blockuser', async (req, res) => {

    if (req.query.block) {
        const data = await blockUser(req.query.block);

    } else if (req.query.unblock) {
        const data = await unBlockUser(req.query.unblock);
    }


    res.redirect('/profile?nav=users')


})



router.get('/editprofile', isAuth, renderEditProfile)

router.post('/editprofile', isAuth, upload.single('profilePicture'), updateUser);

router.post('/address', isAuth, addAddress)

router.get('/address/delete', isAuth, deleteAddress)





module.exports = router;