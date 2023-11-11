const session = require('express-session');

const sessionMiddleware = session({
    secret: 'sdafhna324bjsdf62621%^%61266@!#asdasdfafd',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
});

module.exports = sessionMiddleware;