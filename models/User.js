const mongoose = require('mongoose');
const schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('password-local-mogoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please supply an email address'
    },
    name: {
        type: String,
        trim: true
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

userSchema.plugin(mongodbErrorHandler)

modules.exports = mongoose.model('User', userSchema);