'use strict';

const responder = require('./httpRouteResponder');

exports.authorize = function(req, res, next) {
	responder.response(res, {
		'Endpoint': 'GET /authorize'
	});
};