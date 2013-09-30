
var fs = require('fs')
    , path = require('path')
    , Place = require('../models/place.js')
    , Review = require('../models/review.js');

var calcDistance = function(obj){

};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findByCategory = function(req, res) {
    var category = req.params.category;
    var query = Place.find({category: new RegExp(category, 'i')});

    query.exec(function (err, places) {
        if (err) console.log(err);
        res.send(places);
    });
};

exports.findAll = function(req, res) {
    //return all places
    var query = Place.find({}).select('-reviews');

    query.exec(function (err, places) {
        if (err) console.log(err);
        res.send(places);
    });
};

exports.addPlace = function(req, res) {
    var place = req.body.place;
    var review = req.body.review;

    new Place(place).save(function (err, p) {
        if (err){
            res.send(400, err);
        }

        review.placeId = p.id;
        new Review(review).save(function (err, r){
            if (err){
                res.send(400, err);
            }
            console.log(r);
            p.reviews.push(r.id);
            p.save();
        });

        res.send(201, p);
    });

};
