const querystring = require('querystring');


const errorHandler = ((err, req, res, next) => {

    

    console.log('Error Logger::::::', err);

    res.cookie("notify", "Internal error occured.");
    const parsedQuery = querystring.parse(err.message);
    const notify = parsedQuery.notify;
    const redirect = parsedQuery.redirect;

    if(notify) res.cookie("notify",notify);
    if (redirect) res.redirect(redirect);

    res.redirect('/');
})

module.exports = errorHandler;