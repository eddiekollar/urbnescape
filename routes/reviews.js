
var Review = require('../models/review.js');

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findByPlaceId = function (req, res) {
    // get the user by the user id.
    console.log(req.params.placeId);
    Review.find({'placeId': req.params.placeId}, function (err, reviews) {
        if (err) {
            return res.send(400, err);
        }
        // send the found user back to the client
        return res.send(reviews);
    });
};

exports.create = function(req, res) {
    var review = req.body.review;

    new Review(review).save(function (err, r){
        if (err){
            res.send(400, err);
        }
    });

    res.send(201, r);
};
