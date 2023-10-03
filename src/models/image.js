const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalName: String,
    mimetype: String,
    imageID: mongoose.mongo.ObjectId
})  

const Image = mongoose.model('Image',imageSchema);

module.exports = Image;