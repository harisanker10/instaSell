const express = require('express');
const app = express();
const {addUser,checkUserExist,authUser,getUser} = require('../controllers/userController');
const router = require('express').Router();
const bodyParser = require('body-parser')
const multer = require('multer');
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });


router.get('/login',(req,res)=>{
    if(req.session.username) res.redirect('/');
    res.render('login',{title: 'Log In'})
})

router.post('/login',upload.any(), async(req,res)=>{
    console.log('logggingg innn')
    console.log(req.body);
    const user = await authUser(req.body);
    if(user){
    req.session.username = user.username;
    req.session.userID = user._id;
    res.redirect('/');
    console.log(user)
    }
    else{
        
        res.status(201).send({message:'User not found'});
    }
})

router.get('/signup',(req,res)=>{
    if(req.session.username) res.redirect('/');
    res.render('signup.ejs',{title: 'Register'});
})


router.post('/signup', upload.any(), async (req, res) => {
    console.log(req.body);
    try {
        const exist = await checkUserExist(req.body);
        console.log(`User exist ::::: ${exist}`)
        if(!exist){
        const user = await addUser(req.body);
        req.session.username = req.body.username; 
        req.session.userID = user._id;
        res.status(201).send({message:'registered succesfully'});
        }
        else{
            res.status(409).send({message:'User Exist'});
        }
    } catch(err) {
        console.error(err);
        res.status(500).send({message:'Internal error'});
    }
});

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
})

router.get('/profile',async(req,res)=>{
    if(!req.session.userID)res.redirect('/user/login');
    const {user, joinedDate} = await getUser(req.session.userID);
    res.render('profile',{title: 'Profile', joinedDate:joinedDate, user: user});

})




module.exports = router;