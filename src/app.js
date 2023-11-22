const express = require('express');
const http = require('http'); 
const {webhook} = require('./controllers/productController.js');


const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app); 

const errorHandler = require('./middleware/errorHandler')
const sessionMiddleware = require('./middleware/sessionMiddleware.js')
const localsSet = require('./middleware/localsSetup.js');
const {connect} = require('../config/development/connection.js')
connect();



app.use(sessionMiddleware);

const initializeSocket = require('./socket.js');
const io = initializeSocket(server);


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

app.use(localsSet)


app.set('views', path.join(__dirname, '../views'));
const indexRouter = require('./routes/index');
const productRouter = require('../src/routes/product.js');
const categoryRouter = require('../src/routes/category');
const addressRouter = require('../src/routes/address');
const chatRouter = require('../src/routes/chats');

app.post('/webhook',webhook)
app.use('/', indexRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);
app.use('/address', addressRouter);
app.use('/chats', chatRouter);


app.use(errorHandler);



const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
