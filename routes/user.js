'use strict';

/**
 * User API Routes.
 */

var user = require('../models/user');

// GET */users
exports.list = function (req, res) {
    res.send('not implemented');
};

// PUT */user
exports.create = function (req, res) {
    // Create a new user
    var password = req.body.password;
    user.User.createFromProfile(req.body, function (err, u) {
        if (err) {
            return res.send(400, err);
        }

        user.User.setPassword(u.id, password, function(err, u) {
             if (err) {
                return res.send(400, err);
             }

             req.logIn(u,function(err){
                 if (err) {
                     res.send(400,err);
                 }
             });
             return res.send(201, u.getProfile());
        });

        //return res.send(201, null);
    });
};

// GET */users/{id}
exports.read = function (req, res) {
    // get the user by the user id.
    user.User.findById(req.params.userId, function (err, u) {
        if (err) {
            return res.send(400, err);
        }
        // send the found user back to the client
        return res.send(201, u.getProfile());
    });
};

// PUT */users/{id}
exports.update = function (req, res) {
    // get the user by the user id.
    // a user can only update their own entity
    // TODO admin should be able to modify all.
    if (!req.session.userId || (String(req.session.userId) !== String(req.params.userId))) {
        return res.send(403); // forbidden
    }
    user.update(req.params.userId, req.body, function (err, u) {
        // send the found user back to the client
        return res.send(u.getProfile());
    });
};

// DELETE */users/{id}
exports.delete = function (req, res) {
    // get the user by the user id.
    user.delete(req.params.userId, function (err) {
        // send the found user back to the client
        return res.send();
    });
};

// GET */users/me
exports.current = function (req, res) {
    // if there is no userId return not found 401 Unauthorized
    if (!req.session.userId) {
        return res.send(401); // Unauthorized
    }
    // get the user by the user id stored in the session
    user.read(req.session.userId, function (err, u) {
        // send the found user back to the client
        return res.send(u.getProfile() || {});
    });
};
