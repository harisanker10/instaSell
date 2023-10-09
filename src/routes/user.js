const express = require('express');
const app = express();
const router = require('express').Router();
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { getCategories } = require('../controllers/categoryController');
const { isAuth } = require('../middleware/isAuth')

const { addUser, checkUserExist, authUser, getUser, blockUser, unBlockUser, updateUser, getProfileNavData } = require('../controllers/userController');
const { getProductCards } = require('../controllers/productController')




router.get('/login', (req, res) => {
    if (req.session.username) res.redirect('/');
    res.render('login', { title: 'Log In' })
})

router.post('/login', upload.any(), async (req, res, next) => {


    try {

        const user = await authUser(req.body);
        if (user) {
            req.session.username = user.username;
            req.session.userID = user._id;
            if (user?.role === 'admin') req.session.isAdmin = true;
            res.redirect('/');
        }
        else {
            throw new Error("User Not Found")
        }
    } catch (err) {
        console.log(err)
        err.redirect = '/user/login'
        next(err);

    }
})

router.get('/signup', (req, res, err) => {
    if (req.session.username) res.redirect('/');
    res.render('signup.ejs', { title: 'Register' });
})


router.post('/signup', upload.any(), async (req, res, next) => {
    console.log('incoming user',req.body)
    
    try {
        const exist = await checkUserExist(req.body);
        if (exist) {
            const err = new Error('User exist')
            err.notify = "User exists";
            err.redirect = "/user/signup";
            throw err;
        }
        const user = await addUser(req.body);
        req.session.username = req.body.username;
        req.session.userID = user._id;
        res.cookie("notify", "Registered Successfully. Complete profile now.");
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.get('/profile', isAuth, async (req, res, next) => {

    try{

        const user = await getUser(req.session.userID)
        let data = { analytics: "analytics" };
        data = await getProfileNavData(req.query.nav,req.session.userID)
        if (req.session.isAdmin) res.render('adminpanel', { title: 'Administration', user: user, data: data });
        res.render('profile', { title: 'Profile', user: user, data: data });
    }
    catch(err){
        next(err)
    }


})

router.get('/blockuser', async (req, res) => {

    if (req.query.block) {
        const data = await blockUser(req.query.block);

    } else if (req.query.unblock) {
        const data = await unBlockUser(req.query.unblock);
    }


    res.redirect('/user/profile?nav=users')


})

router.get('/editprofile', async (req, res) => {


    const user = await getUser(req.session.userID);
    res.render('editprofile', { title: 'Edit Profile', user: user });
})

router.post('/editprofile', async (req, res) => {

    console.log("incoming",req.body)
    const data = await updateUser(req.body, req.session.userID)
    if(data)res.cookie("notify","Updated Successfully");
    res.redirect('/user/profile')
})




module.exports = router;