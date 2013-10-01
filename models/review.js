
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,Place = require('../models/place.js');

var Review;

var reviewSchema = new Schema({
    quietlevel:     { type: Number, default: 1},
    crowd:          { type: Number, default: 1},
    tips:           { type: String, default: ''},
    placeId:          { type: Schema.Types.ObjectId, ref: 'Place'},
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User'},
    createdDate:    { type: Date, default: Date.now}
});

reviewSchema.path('quietlevel')
    .set(function (newVal) {
        this._oldquietlevel = this.quietlevel;
        return newVal;
    });

reviewSchema.path('crowd')
	.set(function(newVal){
		this._oldcrowd = this.crowd;
		return newVal;
	});

reviewSchema.post('save', function (doc) {
	var oldquietlevel = this._oldquietlevel;
	var oldcrowd = this._oldcrowd;
	Place.findById(doc.placeId, function(err, place){
		if(err){
			console.log(err);
			return;
		}

		if(place.reviews.length === 0){
			place.crowdScore = doc.crowd;
			place.quietlevelScore = doc.quietlevel;
		}
		else{
			if(place.reviews.indexOf(doc._id) === -1){
				place.crowdScore = ((place.crowdScore * place.reviews.length) + doc.crowd) / (place.reviews.length + 1);
				place.quietlevelScore = ((place.quietlevelScore * place.reviews.length) + doc.quietlevel) / (place.reviews.length + 1);
			}else{
				place.crowdScore = ((place.crowdScore * place.reviews.length) + (doc.crowd - oldcrowd)) / place.reviews.length;
				place.quietlevelScore = ((place.quietlevelScore * place.reviews.length) + (doc.quietlevel - oldquietlevel)) / place.reviews.length;
			}
		}
		if(place.reviews.indexOf(doc._id) === -1){
			place.reviews.push(doc._id);
		}
		place.save();
  });
});

reviewSchema.post('remove', function (doc) {
	Place.findById(doc.placeId, function(err, place){
		if(err){
			console.log(err);
			return;
		}

		place.reviews.splice(place.reviews.indexOf(doc._id), 1);

		place.crowdScore = ((place.crowdScore * place.reviews.length) - doc.crowd) / place.reviews.length;
		place.quietlevelScore = ((place.quietlevelScore * place.reviews.length) - doc.quietlevel) / place.reviews.length;

		place.save();

	});
});

module.exports = Review = mongoose.model('Review', reviewSchema);