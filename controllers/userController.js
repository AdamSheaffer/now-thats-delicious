const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
    return res.render('login', { 
        title: 'Login'
    }); 
};

exports.registerForm = (req, res) => {
    return res.render('register', {
        title: 'Register'
    });
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'That Email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'You must supply a password!').notEmpty();
    req.checkBody('confirm-password', 'You must supply a password!').notEmpty();
    req.checkBody('password', 'Passwords do not match').equals(req.body['confirm-password']);

    const errors = req.validationErrors();
    
    if(errors) {
        req.flash('error', errors.map(e => e.msg));
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash()
        });
        return;
    }

    next();
};