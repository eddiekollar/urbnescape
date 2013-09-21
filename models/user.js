'use strict';

// Imports
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require('../utils/utils');
var bcrypt = require('bcrypt');

// Variables
var User;

// Constants
var PASSWORD_LENGTH_MIN = 4;
var PASSWORD_LENGTH_MAX = 34;

var userSchema = new Schema({
    profile: {
        name  : {
            last   : String,
            first  : String
        },
        username: { type: String, unique: true},
        email : { type: String, unique: true}
    },
    auth: {
        provider: {
            name: { type: String, default: 'local' },
            url: { type: String, default: 'local' }
        },
        passwordHash: String
    },
    reviews:    [{type: Schema.Types.ObjectId, ref: 'Review'}],
    favorites:    [{type: Schema.Types.ObjectId, ref: 'Place'}],
    createdAt: Date
});

userSchema.path('createdAt')
    .default(function () {
        return new Date();
    })
    .set(function (v) {
        return v === 'now' ? new Date() : v;
    });

// Statics
userSchema.statics.createFromProfile = function (p, fn) {
    var u = new User();
    delete p.password;
    p.username = p.username.toLowerCase();
    p.email = p.email.toLowerCase();
    console.log(p);
    u.profile = p;
    u.save(fn);
};

userSchema.statics.setPassword = function(userId, passwordRaw, fn) {
    // confirm the the length of the password is valid
    if (passwordRaw.length <= PASSWORD_LENGTH_MIN || passwordRaw.length >= PASSWORD_LENGTH_MAX) {
        //return fn(errors.invalidPasswordLengthError, null);
    }

    // encrypt the password using bcrypt
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(passwordRaw, salt, function (err, hash) {
            if (err) {
                return fn(err, null);
            }

            User.findById(userId, function(err, u){
                if(err){
                    fn(err, null);
                }if(!u){
                    //error user doesn't exist
                    fn(err, null);
                }else{
                    u.auth.passwordHash = hash;
                    u.save(function (err) {
                        return fn(err, u);
                    });
                }
            });
        });
    });
};

userSchema.statics.findByEmail = function (address, fn) {
    User.findOne({'profile.email': address}, fn);
};

userSchema.statics.findByUsername = function (username, fn) {
    User.findOne({'profile.username': username}, fn);
};

userSchema.statics.findByEmailOrUsername = function (username, fn) {
    // Determine if we have an email address or a username
    var isValid = utils.validateEmail(username);
    if (isValid) {
        User.findByEmail(username, fn);
    } else {
        User.findByUsername(username, fn);
    }
};

//Synchronous version
userSchema.statics.findOneOrCreate = function(accessToken, refreshToken, fbprofile) {
    User.findByEmailOrUsername(fbprofile.email, function (err, u) {
        if (!u) {
            var profile = {
                name    : {
                    first  : fbprofile.first_name,
                    last   : fbprofile.last_name
                },
                email : fbprofile.email
            };
            User.createFromProfile(profile,function (err, u) {
                if (err) {
                    //
                    return null;
                }

                return u.getProfile();
            });
        } else {
            return u.getProfile();
        }
    });
};

userSchema.statics.authenticate = function (userId, pass, fn) {
    User.findById(userId, function (err, p) {
        if (!p) {
            console.log(err);
            fn(err, false);
        } else {
            bcrypt.compare(pass, p.auth.passwordHash, fn);
        }
    });
};

userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    return obj;
};

// getProfile is a hack to get return virtual properties.
userSchema.methods.getProfile = function () {
    var obj = this.toObject();
    delete obj.auth;
    delete obj.createdAt;
    return obj;
};

userSchema.set('toObject', { getters: true });
userSchema.set('toJSON', { getters: true });

exports.User = User = mongoose.model('User', userSchema);
