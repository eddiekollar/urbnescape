'use strict';

var passport            = require('passport')
    , LocalStrategy     = require('passport-local').Strategy
    , FacebookStrategy  = require('passport-facebook').Strategy
    , config            = require('../config')
    , user              = require('../models/user');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function (user, fn) {
    fn(null, user.id);
});

passport.deserializeUser(function (id, fn) {
    user.User.findById(id, function (err, user) {
        fn(err, user);
    });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
    function (username, password, fn) {
        user.User.findByEmailOrUsername(username, function (err, usr) {
            if (err) {
                return fn(err, false, {message: 'An Error occured'});
            }
            if (!usr) {
                return fn(err, false, {message: 'Unknown username'});
            }
            console.log("Local strategy id: " + usr._id);
            user.User.authenticate(usr._id, password, function (err, valid) {
                if (err) {
                    return fn(err);
                }
                if (!valid) {
                    return fn(null, false, {message: 'Invalid Password'});
                }
                return fn(err, usr);
            });
        });
    }
));

//TODO: Setup environment specific callback URL
passport.use(new FacebookStrategy({
        clientID: config.fb.appId,
        clientSecret: config.fb.appSecret,
        callbackURL: 'https://127.0.0.1:3000/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            user.User.findOneOrCreate(accessToken, refreshToken, profile);
            return done(null, profile);
        });
    }
));

exports.login = function (req, res, fn) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return fn(err);
        }
        if (!user) {
            return res.send(401, info);
        }

        req.logIn(user, function (err) {
            if (err) {
                return fn(err);
            }
            return res.send(200, user.getProfile());
        });
    })(req, res, fn);
};

exports.fblogin = function(){
    passport.authenticate('facebook');
};
exports.fbcallback = function(){
    passport.authenticate('facebook', { failureRedirect: '/error' }),
        function(req, res){
            res.send(200, 'Successfully authenticated.');
        };
};

// GET */logout
exports.logout = function (req, res) {
    req.logout();
    res.send(200, 'Successfully logged out.');
};

