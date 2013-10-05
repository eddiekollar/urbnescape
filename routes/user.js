'use strict';

var user = require('../models/user').User;

exports.list = function (req, res) {
    //Implement for admins
    res.send('not implemented');
};

exports.create = function (req, res) {
    // Create a new user
    var password = req.body.password;
    user.createFromProfile(req.body, function (err, u) {
        if (err) {
            console.log(err);
            return res.send(400, err);
        }

        user.setPassword(u.id, password, function(err, u) {
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
    });
};

exports.read = function (req, res) {
    // get the user by the user id.
    user.findById(req.params.userId, function (err, u) {
        if (err) {
            return res.send(400, err);
        }
        // send the found user back to the client
        return res.send(201, u.getProfile());
    });
};

exports.update = function (req, res) {
    if (!req.user || (String(req.user) !== String(req.body.userId))) {
        return res.send(403); // forbidden
    }
    user.update(req.user, req.body.user, function (err, u) {
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

exports.delete = function (req, res) {
    // get the user by the user id.
    user.delete(req.params.userId, function (err) {
        // send the found user back to the client
        return res.send();
    });
};

exports.current = function (req, res) {
    console.log(req.user);
    // if there is no userId return not found 401 Unauthorized
    /*
    if (!req.session.userId) {
        return res.send(401); // Unauthorized
    }*/
    // get the user by the user id stored in the session
    user.findById(req.user, function (err, u) {
        if (err) {
            return res.send(400, err);
        }
        if(!u){
            return res.send(400);
        }else{
        return res.send(201, u.getProfile());
        }
    });
};

exports.unique = function (req,res) {
    if(req.params.uniqueField == 'username'){
        user.findOne({'profile.username' : req.body.field.toLowerCase()}, function(err, u){
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
        user.findOne({'profile.email' : req.body.field.toLowerCase()}, function(err, u){
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
    user.favoritesIds(req.user, function(err, f){
        if(err) {
            return res.send(401, err);
        }else{
            return res.send(f);
        }
    });
};

exports.addFavorite = function(req, res) {
    var placeId = req.body.placeId;

    user.findById(req.user, function(err, u){
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
    var placeId = req.params.placeId;

    user.findById(req.user, function(err, u){
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
