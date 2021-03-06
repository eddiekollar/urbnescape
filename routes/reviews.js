
var Review = require('../models/review.js');

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving place: ' + id);

};

exports.findByPlaceId = function (req, res) {
    Review.find({'placeId': req.params.placeId})
        .populate('createdBy', 'profile.username')
        .exec(function(err, reviews) {
        if (err) {
            console.log(err);
            return res.send(400, err);
        }else{
            return res.send(reviews);
        }
    });
};

exports.findByUserAndPlaceId = function(req, res){
    Review.findOne({'placeId': req.params.placeId})
        .where('createdBy').equals(req.user)
        .populate('createdBy', 'profile.username')
        .exec(function(err, review) {
            if (err) {
                console.log(err);
                return res.send(400, err);
            }if (!review){
                return res.send({});
            }else{
                return res.send(review);
            }
        });
};

exports.create = function(req, res) {
    var review = req.body.review;
    new Review(review).save(function (err, r){
        if (err){
            return res.send(400, err);
        }if(!r){
            return res.send({});
        }else{
            return res.send(r);
        }
    });
};

exports.update = function (req, res) {
    var review = req.body.review;
    var reviewId = req.body.review._id;

    delete(review.__v);
    delete(review._id);
    delete(review.createdBy);
    delete(review.createdDate);

    Review.findById(reviewId, function (err, r) {
        if (err) {
            return res.send(400, err);
        }
        if(!r){
            return res.send({});
        }else{
            r.crowd = review.crowd;
            r.quietlevel = review.quietlevel;
            r.tips = review.tips;
            r.save();
            return res.send(201, r);
        }
    });
};

exports.delete = function(req, res) {
    Review.findByIdAndRemove(req.params.reviewId, function(err, r) {
        if (err){
            return res.send(400, err);
        }
        else{
            return res.send(200);
        }
    });
};