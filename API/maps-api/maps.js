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
    	console.log(err);
		completion(err);
	});
};

exports.getPhoto = function(photo_ref, completion) {
	googleMapsClient.placesPhoto({
		photoreference: photo_ref,
		maxwidth: 256,
		maxheight: 256
	}).asPromise().then((response) => {
		completion(response);
	}).catch((err) => {
		completion(err);
	})
};

exports.getPlace = function(id, completion) {
	googleMapsClient.place({
		placeid: id
	})
	.asPromise()
	.then((response) => {
		completion(response);
	})
	.catch((err) => {
		completion(err);
	});
};