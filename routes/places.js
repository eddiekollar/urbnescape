
var Place = require('../models/place.js')
    , user = require('../models/user.js').User
    , Review = require('../models/review.js')
    , haversine = require('../utils/haversine.js');

var createDistFunc = function(req){
    return function(obj){
        obj = obj.toObject();
        if(req.cookies['geo.lat'] && (typeof req.cookies['geo.lat'] !== 'undefined')){
            var geo = {lat: Number(req.cookies['geo.lat']), lon: Number(req.cookies['geo.lon'])};
            obj.geoData.distance = haversine(geo, obj.geoData.latLngs[0]);
        }else{
            obj.geoData.distance = 0;
        }
        return obj;
    };
};

exports.findById = function(req, res) {
    Place.findById(req.params.placeId, function(err, place){
        if(err){
            res.send(400, err);
        }else if(!place){
            res.send(400);
        }else if(place){
            place = createDistFunc(req)(place);
            res.send(place);
        }
    });
};

exports.findByCategory = function(req, res) {
    var category = req.params.category;
    var query = Place.find({category: new RegExp(category, 'i')});

    var calcDistance = createDistFunc(req);

    function compare(a,b) {
      if (a.geoData.distance < b.geoData.distance)
         return -1;
      if (a.geoData.distance > b.geoData.distance)
        return 1;
      return 0;
    }

    query.exec(function (err, places) {
        if (err){
            console.log(err);
            res.send(400, err)
        }else{
            places = places.map(calcDistance);
            places.sort(compare);
            res.send(places);
        }
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
        if(!p){
            res.send(400, {});
        }if(p){
            review.placeId = p.id;
            new Review(review).save(function (err, r){
                if (err){
                    console.log("Review error: " + err);
                    //res.send(400, err);
                }
            });
            res.send(201, p);
        }
    });
};

exports.favoritesByUserId = function(req, res) {
    user.favoritesIds(req.user, function(err, f){
        if(err){
            res.send(400, err);
        }else{
            var query = Place.find({}).select('-reviews').where('_id').in(f);
            query.exec(function (err, places) {
                if (err) {
                    console.log(err);
                    res.send(400, err);
                }else{
                    res.send(places);
                }
            });
        }
    });
};

exports.update = function(req, res) {
    var place = req.body.place;
    var id = req.body.place._id;

    delete(place.__v);
    delete(place._id);
    delete(place.createdBy);
    delete(place.createdDate);

    Place.findByIdAndUpdate(id, place, function(err, p){
        if(err) {
            console.log(err);
            res.send(400, err);
        }
        else{
            res.send(p);
        }
    });
};