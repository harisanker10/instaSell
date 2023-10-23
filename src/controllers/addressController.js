const Address = require('../models/address');

const addAddress = async(data,id)=>{
    
    
    try{

        const address = new Address({
            userID: id,
            fullname: data.fullname,
            city:data.city,
            state:data.state,
            postalCode:data.postalCode,
            phone: data.phone,
            addressLine:data.addressLine
        })
        
        const res = await address.save();
        console.log(res)
        return res;
    }catch(err){
        return err;
    }
}

const getAddress = async(id)=>{
    try{

        return await Address.find({userID:id}).lean();
    }catch(err){
        return err;
    }
}

module.exports = {addAddress,getAddress}