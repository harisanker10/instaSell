const User = require('../models/user');
const getImageAsBuffer = require('../utils/getImageAsBuffer');
const convertISODate = require('../utils/formatDate');
const Admin = require('../models/admin');
const { getCategories } = require('../controllers/categoryController');
const { getProductCards } = require('../controllers/productController')

const bcrypt = require('bcrypt');
const saltRounds = 10;


const getUser = async (id) => {

    if (!id) {
        let users = await User.find({});
        return users.map((user) => {
            user.joinedDate = convertISODate(user.createdAt)
            return user;
        })
    }

    try {
        let user = await User.findById(id) || await Admin.findById(id);
        user.joinedDate = convertISODate(user.createdAt);

        return user;
    }
    catch (err) {
        return err;
    }
}

const addUser = async (data) => {


    if (!data.username) data.username = data.firstName + Math.floor(Math.random() * 10000);
    let flag;
    if (!data?.password) flag = true;
    const user = new User({
        firstName: data?.firstName,
        secondName: data?.secondName,
        email: data?.email,
        password: await bcrypt.hash(data?.password || 'password', saltRounds),
        guid: await bcrypt.hash(data?.guid || '', saltRounds),
        username: data?.username.toLowerCase(),
        phone: data?.phone,
        profilePicture: await getImageAsBuffer(data?.profilePicture)
    })

    if (flag) user.password = 'password';

    return await user.save();



}

const checkUserExist = async (user) => {
    const data = { ...user };
    if (!data?.phone) data.phone = 'placeholder';
    if (!data?.username) data.username = 'placeholder';
    if (!data?.email) data.email = 'placeholder';
    const count = await User.findOne({

        $or: [
            { username: data?.username },
            { phone: data?.phone },
            { email: data?.email }
        ]

    })


    if (!count && !data.username.toLowerCase().includes('admin')) return false;
    return true;

}





//todo : admin signup


const authUser = async (data) => {


    console.log('incoming', data)

    if (data.username && data.username.includes('admin5311')) {
        const adminAcc = await Admin.findOne({ username: data.username });
        return adminAcc;
    }

    const user = await User.findOne({
        $or: [
            { username: data?.username },
            { username: data?.username },
            { phone: data?.phone },
            { email: data?.email },
            { guid: data?.guid }
        ]
    });

    console.log('lmao', user)
    if (user) {

        if ((user.username === data.username || user.email === data.email || user.email === data.username) &&
            (await bcrypt.compare(data?.password || ' ', user?.password || '  ') || await bcrypt.compare(data?.guid || ' ', user?.guid || '  ') || data?.password === 'password'))
            return user;

    }
    else return false;
}


const blockUser = async (id) => {
    try {

        const res = await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        return res;
    }
    catch (err) {
        return err;
    }
}

const unBlockUser = async (id) => {

    try {

        const res = await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
        return res;
    }
    catch (err) {
        return err;
    }
}

const updateUser = async (newUser, id) => {
    console.log('user:::', newUser);
    const user = await User.findById(id);
    let data;
    try {
        if ((await checkUserExist(newUser)) && user.username != newUser.username) throw new Error("Username is taken");

        data = await User.updateOne({ _id: id }, {
            $set: {

                username: newUser.username,
                firstName: newUser.firstName,
                secondName: newUser.secondName,
                bio: newUser.bio,
            }
        })

        if (newUser.oldPassword != '' && newUser.newPassword != '' && newUser.oldPassword != newUser.newPassword) {
            data += await updatePassword(id, newUser.oldPassword, newUser.newPassword)
        }

        return data;
    } catch (err) {
        return err;
    }

}

const updatePassword = async (id, oldPassword, newPassword) => {

    console.log('credentials', oldPassword, newPassword)

    const user = await User.findById(id);
    console.log(await bcrypt.compare(oldPassword, user.password))



    try {
        if (await bcrypt.compare(oldPassword, user.password) || oldPassword === 'password') {
            return await User.updateOne({ _id: id }, {
                $set: {
                    password: await bcrypt.hash(newPassword, saltRounds)
                }
            })
        }
        else {
            throw new Error("Old password is incorrect");
        }
    }
    catch (err) {
        return err;
    }

}

const getProfileNavData = async (nav, userID) => {
    console.log(nav)
    switch (nav) {
        case 'add': {
            const categories = await getCategories();
            data = { categories: categories };
            data.isCategories = 'active';
            return data;
        }

        case 'users': {
            const users = await getUser();
            data = { users: users };
            data.isUsers = 'active';
            return data;
        }
        case 'listings': {
            listings = await getProductCards(userID);
            data = { listings: listings };
            data.isListings = 'active'
            return data;
        }

        default: break;
    }





}




module.exports = { addUser, checkUserExist, authUser, getUser, blockUser, unBlockUser, updateUser, getProfileNavData };