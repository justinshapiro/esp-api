'use strict';

const responder = require('./httpRouteResponder');

exports.notification = function(req, res) {
	responder.response(res, {
		'Endpoint': 'POST /notification'
	});
};