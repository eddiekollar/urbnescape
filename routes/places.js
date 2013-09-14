/**
 * Created with JetBrains WebStorm.
 * User: eddie
 * Date: 8/13/13
 * Time: 3:14 PM
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs')
    , path = require('path')
    , Place = require('../models/place.js')
    , Review = require('../models/review.js')

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findByCategory = function(req, res) {
    console.log(req.session);
    var category = req.params.category;
    console.log('Retrieving places by category: ' + category);

    var query = Place.find({category: new RegExp(category, 'i')});

    query.exec(function (err, places) {
        if (err) console.log(err);
        res.send(places);
        console.log('Number of places found: ', places.length);
    });
};

exports.findAll = function(req, res) {
    console.log('Retrieving all places.');
    //return all places
    var query = Place.find({});

    query.exec(function (err, places) {
        if (err) console.log(err);
        res.send(places);
        console.log('Number of places found: %i', places.length);
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
        });

        res.send(201, p);
    });

};
