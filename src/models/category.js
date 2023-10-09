const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        unique:true
    },
    creationDate:{
        type:Date,
        default: Date.now()
    }

})

const subCategorySchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },
    creationDate:{
        type:Date,
        default: Date.now()
    },
    categoryID:{
        type:mongoose.mongo.ObjectId,
        required:true
    }


})

const Category = mongoose.model('Category',categorySchema);
const SubCategory = mongoose.model('subCategory',subCategorySchema);
module.exports = {Category, SubCategory};

