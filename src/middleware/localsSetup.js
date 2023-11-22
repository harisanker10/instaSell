
require('dotenv').config();

const localsSet = (req, res, next) => {
    if (req.session.isAdmin) res.locals.isAdmin = true;
    else res.locals.isAdmin = null;
    if (req.session.username) {
        res.locals.username = req.session.username;
        res.locals.userID = req.session.userID;
    } else {
        res.locals.username = null;
        res.locals.userID = null;
    }

    res.locals.SERVER_URL = process.env.SERVER_URL;


    next();
};

module.exports = localsSet;