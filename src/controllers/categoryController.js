const { Category, SubCategory } = require('../models/category');


const getCategories = async () => {
    return await Category.find({}, { name: 1 });

}
const getSubCategories = async (id) => {
    if (!id) return await SubCategory.find({ categoryID: id }, { name: 1 });
    return await SubCategory.find({ categoryID: id }, { name: 1 });

}


const addCategory = async (name) => {


    try {
        const category = new Category({
            name: name.trim().toLowerCase(),
        })
        const savedCat = await category.save();
        return savedCat;
    }

    catch (err) {

        return err;

    }


}


const addSubCategory = async (ID, name) => {

    try {
        const subCategory = new SubCategory({
            name: name.trim().toLowerCase(),
            categoryID: ID
        })

        const data = subCategory.save()
        return data;
    }

    catch (err) {
        return err;
    }



}

const deleteCategory = async (id) => {
    try {
        const data = await Category.deleteOne({ _id: id });
        console.log('response:::::', data);
    }
    catch (err) {
        return err;
    }
}
const deleteSubCategory = async (id) => {
    try {
        const data = await SubCategory.deleteOne({ _id: id });
    }
    catch (err) {
        return err;
    }
}



module.exports = { addCategory, addSubCategory, getCategories, getSubCategories, deleteCategory, deleteSubCategory };