const Promise = require('q').Promise;

// Authorize Client
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDhSibfX0DdBHsUFc1OdvARvsLiuEfQ7Jc',
    Promise: Promise
});

exports.places = function(lat, lon, rad, category, completion) {
    googleMapsClient.placesNearby({
		language: 'en',
		location: [lat, lon],
		radius: rad,
		opennow: true,
		type: category
	})
	.asPromise()
	.then((response) => {
		completion(response);
	})
	.catch((err) => {
		completion(err);
	});
};
