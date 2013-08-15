/**
 * Created with JetBrains WebStorm.
 * User: eddie
 * Date: 8/13/13
 * Time: 3:14 PM
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs')
    , path = require('path');

//TODO: Add database connectivity


exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findAll = function(req, res) {
    console.log('Retrieving all places.');
    //return all places

};

exports.addPlace = function(req, res) {
    var place = req.body;
    console.log('Adding place: ' + JSON.stringify(place));

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

};
