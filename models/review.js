
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var Review;

var reviewSchema = new Schema({
    quietlevel:     { type: Number, default: 1},
    crowd:          { type: Number, default: 1},
    tips:           { type: String, default: ''},
    createdDate:    { type: Date, default: Date.now},
    placeId :       { type: Schema.ObjectId, unique: true, required: true },
    userId :        { type: Schema.ObjectId, unique: true, required: true }
});

module.exports = Review = mongoose.model('Review', reviewSchema);
