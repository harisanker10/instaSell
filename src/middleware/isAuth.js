const isAuth = async(req,res,next)=>{
    if(!req.session.userID){

        const err =  new Error('Please Log in to Continue');
        err.redirect = '/user/login'; 
        err.notify = 'Please Log In or Sign Up to continue'
        next(err);
        
    } 
    next();

}

module.exports = {isAuth};