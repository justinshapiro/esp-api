'use strict';

const responder = require('./httpRouteResponder');

exports.token = function(req, res) {
	responder.response(res, {
		'Endpoint': 'POST /token'
	});
};
