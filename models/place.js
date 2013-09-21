
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var Place;

var placeSchema = new Schema({
    name:       {type: String, default: ''},
    location:   {type: String, default: ''},
    lat:        {type: Number, default: 0.0},
    lon:        {type: Number, default: 0.0},
    category:   {type: String, default: 'VIEW'},
    description: {type: String, default: ''},
    reviews:    [{type: Schema.Types.ObjectId, ref: 'Review'}],
    createdDate: {type: Date, default: Date.now},
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Place', placeSchema);
