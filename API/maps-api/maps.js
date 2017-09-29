var Promise = require('q').Promise;

// Authorize Client
var googleMapsClient = require('@google/maps').createClient({
 	key: 'AIzaSyDhSibfX0DdBHsUFc1OdvARvsLiuEfQ7Jc',
 	Promise: Promise
});

exports.places = function(lat, lon, rad, completion) {
	var result;

	googleMapsClient.placesNearby({
		language: 'en',
		location: [lat, lon],
		radius: rad,
		opennow: true,
		type: 'hospital'
	})
	.asPromise()
	.then((response) => {
		completion(response.json.results);
	})
	.catch((err) => {
		completion(err);
	});
};
