/**
 * Created with JetBrains WebStorm.
 * User: eddie
 * Date: 8/13/13
 * Time: 3:14 PM
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs')
    , path = require('path')
    , Place = require('../models/place.js');

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findByCategory = function(req, res) {
    var category = req.query.category;
    console.log('Retrieving places by category: ' + category);

    var query = Place.find({category: category});

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
    var place = req.body;

    new Place(place).save(function (err) {
        if (err){
            console.log('Error' + err)
        }

        console.log('Added place: ' + JSON.stringify(place));
    });
    /*
    var outputFilename = path.dirname(__dirname) + '/data/places.json';

    fs.appendFile(outputFilename, JSON.stringify(place, null, 4), function(err) {
        if(err) {
            console.log(err);
            res.send(err);
        } else {
            console.log("JSON saved to " + outputFilename);
            res.send(req.body);
        }
    });
    */

};
