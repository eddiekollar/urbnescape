/**
 * Created with JetBrains WebStorm.
 * User: eddie
 * Date: 8/15/13
 * Time: 10:42 AM
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var placeSchema = new Schema({
    placeId: ObjectId,
    name: {type: String, default: ''},
    location: {type: String, default: ''},
    lat: {type: Number, default: 0.0},
    lon: {type: Number, default: 0.0},
    category: {type: String, default: 'VIEW'},
    description: {type: String, default: ''},
    quietlevel: {type: Number, default: 1},
    crowd: {type: Number, default: 1},
    tips: {type: String, default: ''},
    date: {type: Date, default: Date.now}
});

/*
 {
 "name": "Sweet View",
 "location": "",
 "lat": 32.812327423646074,
 "lon": -117.23782181739807,
 "category": "views",
 "description": "",
 "quietlevel": 1,
 "crowd": 1,
 "tips": ""
 }

 */

module.exports = mongoose.model('Place', placeSchema);
