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

exports.raiseSMSError = function(res, smsError) {
	res.json({"ESP-Error": `Twilio failed to send SMS message and gave the error: ${smsError}`});
};

exports.raiseInternalError = function(res, err) {
	if (err === null) {
		res.json({"ESP-Error": `A database query or API call did not complete successfully`});
	} else {
		res.json({"ESP-Error": `'${err}`});
	}
};

exports.raiseAuthorizationError = function(res, endpoint) {
	res.json({"ESP-Error": `You are not authorized to access the endpoint: ${endpoint}`});
};

exports.raiseAuthenticationError = function(res, user, error) {
	if (error === null || error === undefined) {
		res.json({"ESP-Error": `Failed to authenticate the user with login ID: ${user}`});
	} else {
		res.json({"ESP-Error": `The following error was encountered why trying to authenticate ${user}: ${error}`});
	}
};