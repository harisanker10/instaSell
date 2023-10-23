const express = require('express');
const app = express();
require('dotenv').config();
const { connect } = require('../config/development/connection');
connect();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const errorHandler = require('./middleware/errorHandler');


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.use(session({
    secret: 'sdafhna324bjsdf62621%^%61266@!#asdasdfafd',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
})

app.use((req,res,next)=>{
    if(req.session.isAdmin)res.locals.isAdmin =true;
    else res.locals.isAdmin = null;
    if(req.session.username){
        res.locals.username = req.session.username;
        res.locals.userID = req.session.userID;
    }
    else {
        res.locals.username = null;
        res.locals.userID = null;

    }
    next()
})








app.set('views', path.join(__dirname, '../views'))
const indexRouter = require('./routes/index');
const productRouter = require('../src/routes/product.js');
const categoryRouter = require('../src/routes/category')
const addressRouter = require('../src/routes/address')

app.use('/',indexRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);
app.use('/address', addressRouter)







app.use(errorHandler);




app.listen(process.env.PORT, () => {
    console.log(`Listening at PORT ${process.env.PORT}`);
})


  
  
