
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var Review;

var reviewSchema = new Schema({
    quietlevel:     { type: Number, default: 1},
    crowd:          { type: Number, default: 1},
    tips:           { type: String, default: ''},
    placeId:          { type: Schema.Types.ObjectId, ref: 'Place'},
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
    createdDate:    { type: Date, default: Date.now}
});

module.exports = Review = mongoose.model('Review', reviewSchema);
