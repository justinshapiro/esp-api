'use strict';

const util = require('util');

exports.response = function(res, payload) {
	res.json({"ESP-Response": payload});
};

exports.raiseQueryError = function(res, query) {
	res.json({"ESP-Error": `Argument Error: No argument named ${query} supplied`});
};

exports.raiseMethodError = function(res, method) {
	res.json({"ESP-Error": `HTTP Error: ${method.toUpperCase()} is not a supported method at the given endpoint`});
};

exports.raisePropertyError = function(res, property) {
	res.json({"ESP-Error": `HTTP Error: ${property.toUpperCase()} is not a supported property at the given endpoint`});
};

exports.raiseDetailError = function(res, detail) {
	res.json({"ESP-Error": `HTTP Error: ${detail.toUpperCase()} is not a supported detail at the given endpoint`});
};