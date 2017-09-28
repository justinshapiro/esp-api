'use strict';

var responder = require('./httpRouteResponder');

// Route: /locations
exports.locations = function(req, res, next) {
	responder.response(res, {
		'Endpoint': 'GET /locations'
	});
};

// Route: /locations/{id}
exports.locations_id = function(req, res, next) {
	const arg = req.params.location_id;

	responder.response(res, {
		'Endpoint': 'GET /locations/{id}',
		'Args': arg
	});
};