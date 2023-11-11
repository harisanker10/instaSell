

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
    next();
};

module.exports = localsSet;