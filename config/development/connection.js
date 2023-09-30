const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('DB Connected succesfully');
})
.catch((err)=>{
    console.log(`Error connecting to DB ${err}`);
})



module.exports = mongoose.connection;


