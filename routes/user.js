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
            console.log(err);
            return res.send(400, err);
        }

        user.User.setPassword(u.id, password, function(err, u) {
             if (err) {
                 console.log(err);
                return res.send(400, err);
             }

             req.logIn(u,function(err){
                 if (err) {
                     console.log(err);
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
    /* if (!req.session.userId || (String(req.session.userId) !== String(req.params.userId))) {
        return res.send(403); // forbidden
    } */
    console.log(JSON.stringify(req.body.user));
    user.User.update(req.params.userId, req.body.user, function (err, u) {
        // send the found user back to the client
        if (err) {
            return res.send(400, err);
        }
        if(!u){
            return res.send({});
        }else{
            return res.send(201, u.getProfile());
        }
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
    /*
    if (!req.session.userId) {
        return res.send(401); // Unauthorized
    }*/
    // get the user by the user id stored in the session
    user.User.findById(req.params.userId, function (err, u) {
        if (err) {
            return res.send(400, err);
        }
        if(!u){
            return res.send({});
        }else{
        return res.send(201, u.getProfile());
        }
    });
};

exports.unique = function (req,res) {
    if(req.params.uniqueField == 'username'){
        user.User.findOne({'profile.username' : req.body.field.toLowerCase()}, function(err, u){
            if(err) {
                return res.send(401, err);
            }
            if(!u) {
                return res.send(true);
            }
            if(u) {
                return res.send(false);
            }
        });
    }else if(req.params.uniqueField == 'email'){
        user.User.findOne({'profile.email' : req.body.field.toLowerCase()}, function(err, u){
            if(err) {
                return res.send(401, err);
            }
            if(!u) {
                return res.send(true);
            }
            if(u) {
                return res.send(false);
            }
        });
    }
};

exports.favoritesIds = function(req, res) {
    user.User.findById(req.params.userId, function(err, u){
        if(err) {
            return res.send(401, err);
        }
        if(!u) {
            return res.send([]);
        }
        if(u) {
            return res.send(u.favorites);
        }
    });
};

exports.addFavorite = function(req, res) {
    var userId = req.body.userId;
    var placeId = req.body.placeId;

    user.User.findById(userId, function(err, u){
        if(err) {
            return res.send(401, err);
        }
        if(!u) {
            return res.send(400);
        }
        if(u) {
            u.favorites.push(placeId);
            u.save(function(err, user){
                if(err) {
                    return res.send(401, err);
                }if(!user){
                    return res.send(400, "Can't save");
                }else{
                    return res.send(200);
                }

            });
        }
    });
};

exports.deleteFavorite = function(req, res){
    var userId = req.params.userId;
    var placeId = req.params.placeId;

    user.User.findById(userId, function(err, u){
        if(err) {
            return res.send(401, err);
        }
        if(!u) {
            return res.send([]);
        }
        if(u) {

            //var index = u.favorites.indexOf(placeId);
            //if (index != -1){
                //u.favorites.splice(index, placeId);
                u.favorites.remove(placeId);
                u.save();
            //}
            return res.send(200);
        }
    });
};
