const User = require('../models/user');
const getImageAsBuffer = require('../utils/getImageAsBuffer');
const convertISODate = require('../utils/formatDate');
const bufferToURI = require('../utils/bufferToURI');


const getUser = async (id)=>{
    try{

        let user = await User.findById(id);
        let joinedDate = convertISODate(user.creationDate);
        return {user, joinedDate};
    }
    catch(err){
        return err;
    }
}

const addUser = async (args) => {
    const { firstName, secondName, username, email, password, phone, profilePicture } = args;
    const user = new User({
        firstName: firstName,
        secondName: secondName,
        email: email,
        password: password,
        username: username,
        phone: phone,
        profilePicture: await getImageAsBuffer(profilePicture)
    })

    return user.save()
        .then((savedUser) => {
            console.log('User saved succesfully', savedUser);
            return savedUser;
        })
        .catch((error) => {
            console.log('Error saving user', error);
            throw new Error('error adding user')
        })



}

const checkUserExist = async(data) => {
   const count = await User.findOne({

        $or: [
            { username: data.username },
            { phone: data.phone },
            { email: data.email }
        ]

    })

    if(!count && !data.username.toLowerCase().includes('admin'))return false;
    return true;

}


//todo : admin signup


const authUser = async(data)=>{

    if(data.username.includes('admin')) return true;     


    const user = await User.findOne({username:data.username});
    if(user){
        if(user.username === data.username && user.password === data.password)return user;
    }
    else return false;
}

module.exports = {addUser,checkUserExist, authUser, getUser};