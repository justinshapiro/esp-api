'use strict';

const Promise = require('q').Promise;

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDhSibfX0DdBHsUFc1OdvARvsLiuEfQ7Jc',
    Promise: Promise
});

exports.places = function(latitude, longitude, rad, category, completion) {
    googleMapsClient.placesNearby({
		language: 'en',
		location: [latitude, longitude],
		radius: rad,
		opennow: true,
		type: category
	})
	.asPromise()
	.then(response => { completion(response) })
	.catch(err => { completion(err) });
};

exports.getPhoto = function(photo_ref, completion) {
	googleMapsClient.placesPhoto({
		photoreference: photo_ref,
		maxwidth: 256,
		maxheight: 256
	})
	.asPromise()
	.then(response => { completion(response) })
	.catch(err => { completion(err) })
};

exports.getPlace = function(id, completion) {
	googleMapsClient.place({
		placeid: id
	})
	.asPromise()
	.then(response => { completion(response) })
	.catch(err => { completion(err) });
};