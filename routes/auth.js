var passport            = require('passport')
    , LocalStrategy     = require('passport-local').Strategy
    , FacebookStrategy  = require('passport-facebook').Strategy
    , config            = require('../config')
    , user              = require('../models/user').User;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function (u, done) {
    done(null, u.id);
});

passport.deserializeUser(function (id, done) {
    user.findById(id, function (err, u) {
        if(err){
            done(err);
        }
        else{
            done(null,u.id);
        }
    });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
    function (username, password, fn) {
        user.findByEmailOrUsername(username, function (err, usr) {
            if (err) {
                return fn(err, false, {message: 'An Error occured'});
            }
            if (!usr) {
                return fn(err, false, {message: 'Unknown username'});
            }
            user.authenticate(usr._id, password, function (err, valid) {
                if (err) {
                    return fn(err);
                }
                if (!valid) {
                    return fn(null, false, {message: 'Invalid Password'});
                }else{
                    return fn(err, usr);
                }
            });
        });
    }
));

//TODO: Setup environment specific callback URL
passport.use(new FacebookStrategy({
        clientID: '640008739351430',
        clientSecret: '918715fbba50580edbd07aa8f42e9245',
        callbackURL: 'http://localhost:5000/-/auth/facebook/callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        //process.nextTick(function () {
            u = user.findOneOrCreate(accessToken, refreshToken, profile);
            req.res.redirect('/');
            return done(null, u);
        //});
    }
));

exports.login = function (req, res, fn) {
    passport.authenticate('local', function (err, u, info) {
        if (err) {
            return res.send(err);
        }
        if (!u) {
            return res.send(401, info);
        }

        req.logIn(u, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.send(u.getProfile());
        });
    })(req, res, fn);
};

var loggedin = exports.loggedin = function(req, res){
    console.log("Logged in" + req.user);
};

exports.fblogin = function(req, res, next){
    passport.authenticate('facebook', {scope: ['email']})(req, res, next);
    console.log("arguments beings passed from fblogin authentication call: " + arguments.length);
};

exports.fbcallback = function(req, res, next){
    console.log(arguments[2].toString());
    passport.authenticate('facebook', {failureRedirect: '/' ,successRedirect: '/'},
       function() {
        console.log("callback for fbcallback auth successful");
       })(req, res, next);
    console.log("fbcallback");

};

// GET */logout
exports.logout = function (req, res) {
    req.logout();
    res.send(200, 'Successfully logged out.');
};

