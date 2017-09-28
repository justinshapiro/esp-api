'use strict';

var responder = require('./httpRouteResponder');

exports.token = function(req, res, next) {
	responder.response(res, {
		'Endpoint': 'POST /token'
	});
};
