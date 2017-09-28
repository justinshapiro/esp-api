'use strict';

exports.notification = function(req, res, next) {
	res.send(res.json({
		'Endpoint': 'POST /notification'
	}));
};