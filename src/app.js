const express = require('express');
const app = express();
require('dotenv').config();
const ejs = require('ejs');
const { connection, bucket } = require('../config/development/connection');
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer');
const session = require('express-session');



app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.use(session({
    secret: 'your-secret-key',
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


app.use((req, res, next) => {
    if (req.session.username) {
        res.locals.username = req.session.username
    }
    else { res.locals.username = null }

    next();
})





app.set('views', path.join(__dirname, '../views'))
const userRouter = require('../src/routes/user');
const productRouter = require('../src/routes/product.js');
const categoryRouter = require('../src/routes/category')

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);

app.get('/', (req, res) => {
    res.render('landing', { title: "Home" });
})




app.use((err, req, res, next) => {
    console.log('ERROR LOGGER:', err);
    res.cookie("notify", "Some error occured");
    if (err.message) res.cookie("notify", err.message);

    if (err.notify) res.cookie("notify", err.notify);
    if (err.redirect) res.redirect(err.redirect);
    res.redirect('/');
})




app.listen(process.env.PORT, () => {
    console.log(`Listening at PORT ${process.env.PORT}`);
})

