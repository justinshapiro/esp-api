'use strict';

var responder = require('./httpRouteResponder');
var mapsAPI = require('../maps-api/maps');

// Route: /locations
// Usage: /api/v1/locations?latitude={...}&longitude={...}&radius{...}
exports.locations = function(req, res, next) {
	const latitude = req.query.latitude;
	const longitude = req.query.longitude;
	const radius = req.query.radius;

	if (latitude == null) {
		responder.raiseQueryError(res, 'latitude');
	} else if (longitude == null) {
		responder.raiseQueryError(res, 'longitude');
	} else if (radius == null) {
		responder.raiseQueryError(res, 'radius');
	} else {
		mapsAPI.places(latitude, longitude, parseInt(radius), function(locations) {
			responder.response(res, locations);
		});
	}
};

// Route: /locations/{id}
exports.locations_id = function(req, res, next) {
	const arg = req.params.location_id;

	responder.response(res, {
		'Endpoint': 'GET /locations/{id}',
		'Args': arg
	});
};