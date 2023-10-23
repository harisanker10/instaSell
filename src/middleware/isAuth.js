const isAuth = async(req,res,next)=>{
    if(!req.session.userID){

        const err =  new Error('notify=Please Log In to continue&redirect=/login');
        next(err);
        
    } 
    next();

}

module.exports = {isAuth};