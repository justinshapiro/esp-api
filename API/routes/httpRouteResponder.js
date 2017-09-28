'use strict';

exports.response = function(res, payload) {
	res.send(res.json({
		"Response": payload
	}));
};

exports.raiseMethodError = function(res, method) {
	res.send(res.json({
		"Error": `HTTP Error: ${method.toUpperCase()} is not a supported method at the given endpoint`
	}));
};

exports.raisePropertyError = function(res, property) {
	res.send(res.json({
		"Error": `HTTP Error: ${property.toUpperCase()} is not a supported property at the given endpoint`
	}));
};

exports.raiseDetailError = function(res, detail) {
	res.send(res.json({
		"Error": `HTTP Error: ${detail.toUpperCase()} is not a supported detail at the given endpoint`
	}));
};