'use strict';

const responder = require('./httpRouteResponder');

exports.authorize = function(req, res) {
	responder.response(res, {
		'Endpoint': 'GET /authorize'
	});
};