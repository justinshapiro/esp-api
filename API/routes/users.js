'use strict';

var responder = require('./httpRouteResponder');
var knex = require('../database/db-connection.js');

// Route to find the correct endpoint whose signature is /users/property
function route_property(req, res, next, args, method) {
	const property = args['property'];

	switch (property) {
		case 'name':  responder.response(res, put_name(args));  break;
		case 'email': responder.response(res, put_email(args)); break;
		case 'phone': responder.response(res, put_phone(args)); break;
		case 'contacts': {
			switch (method) {
				case 'get':  responder.response(res, get_contacts(args));  break;
				case 'post': responder.response(res, post_contacts(args)); break;
				default:     responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'get':  responder.response(res, get_locations(args)); break;
				case 'post': responder.response(res, post_locations(args));     break;
				default:     responder.raiseMethodError(res, method);
			}
		} break;
		case 'alert': {
			switch (method) {
				case 'get':    responder.response(res, get_alert(args));    break;
				case 'post':   responder.response(res, post_alert(args));   break;
				case 'delete': responder.response(res, delete_alert(args)); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Route to find the correct endpoint whose signature is /users/property/key
function route_property_key(req, res, next, args, method) {
	const property = args['property'];

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'get':    responder.response(res, get_contacts_id(args));    break;
				case 'delete': responder.response(res, delete_contacts_id(args)); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'get':    responder.response(res, get_locations_id(args));    break;
				case 'delete': responder.response(res, delete_locations_id(args)); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Route to find the correct endpoint whose signature is /users/property/key/detail
function route_property_key_detail(req, res, next, args, method) {
	const property = args['property'];
	const detail = args['detail'];

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'put': {
					switch (detail) {
						case 'phone': responder.response(res, put_contacts_id_phone(args)); break;
						case 'email': responder.response(res, put_contacts_id_email(args)); break;
						default:      responder.raiseDetailError(res, detail);
					}
				} break;
				default: responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'put': {
					switch (detail) {
						case 'name': responder.response(res, put_locations_id_name(args)); break
						default:     responder.raiseDetailError(res, detail);
					}
				} break;
				default: responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Below is individual methods to implement endpoints that needed to be routed 
function put_name(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/name',
		'Args': args
	};

	return data;
}

function put_email(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/email',
		'Args': args
	};

	return data;
}

function put_phone(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/phone',
		'Args': args
	};

	return data;
}

function get_contacts(args) {
	const data = {
		'Endpoint': 'GET /users/{id}/contacts',
		'Args': args
	};

	return data;
}

function post_contacts(args) {
	const data = {
		'Endpoint': 'POST /users/{id}/contacts',
		'Args': args
	};

	return data;
}

function get_locations(args) {
	const data = {
		'Endpoint': 'GET /users/{id}/locations',
		'Args': args
	};

	return data;
}

function post_locations(args) {
	const data = {
		'Endpoint': 'POST /users/{id}/locations',
		'Args': args
	};

	return data;
}

function get_alert(args) {
	const data = {
		'Endpoint': 'GET /users/{id}/alert',
		'Args': args
	};

	return data;
}

function post_alert(args) {
	const data = {
		'Endpoint': 'POST /users/{id}/alert',
		'Args': args
	};

	return data;
}

function delete_alert(args) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/alert',
		'Args': args
	};

	return data;
}

function get_contacts_id(args) {
	const data = {
		'Endpoint': 'GET /users/{id}/contacts/{id}',
		'Args': args
	};

	return data;
}

function delete_contacts_id(args) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/contacts/{id}',
		'Args': args
	};

	return data;
}

function get_locations_id(args) {
	const data = {
		'Endpoint': 'GET /users/{id}/locations/{id}',
		'Args': args
	};

	return data;
}

function delete_locations_id(args) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/locations/{id}',
		'Args': args
	};

	return data;
}

function put_contacts_id_phone(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/contacts/{id}/phone',
		'Args': args
	};

	return data;
}

function put_contacts_id_email(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/contacts/{id}/email',
		'Args': args
	};

	return data;
}

function put_locations_id_name(args) {
	const data = {
		'Endpoint': 'PUT /users/{id}/locations/{id}/name',
		'Args': args
	};

	return data;
}

exports.users_get = function(req, res, next) {
	// No need to route further, continue logic here

	responder.response(res, {
		'Endpoint': 'GET /users'
	});
};

function add_user(auth_type, token) {
	return knex('user_table')
	.insert({authentication_type: auth_type, authentication_token: token})
	.returning('*');
}

// Query Parameters 
// Required: authentication_type
// Optional: authentication_token
exports.users_post = function(req, res, next) {
	// No need to route further, continue logic here
  
	const auth_type = req.query.authentication_type;
	const token = req.query.authentication_token;

	if (auth_type == null) {
		responder.raiseQueryError(res, 'authentication_type');
	} else {
		add_user(auth_type, token).then((user) => {
			responder.response(res, {
				'Endpoint': 'POST /users',
				'DB Result': user
			})
		});
	}
};

exports.users_id_get = function(req, res, next) {
	// No need to route further, continue logic here

	const arg = req.params.user_id;

	responder.response(res, {
		'Endpoint': 'GET /users/{id}',
		'Args': arg
	});
};

exports.users_id_delete = function(req, res, next) {
	// No need to route further, continue logic here

	const arg = req.params.user_id;

	responder.response(res, {
		'Endpoint': 'DELETE /users/{id}',
		'Args': arg
	});
};

exports.users_id_property_get = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under GET /users/{id}
	route_property(req, res, next, args, 'get');
};

exports.users_id_property_put = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under PUT /users/{id}
	route_property(req, res, next, args, 'put');
};

exports.users_id_property_post = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under POST /users/{id}
	route_property(req, res, next, args, 'post');
};

exports.users_id_property_delete = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under DELETE /users/{id}
	route_property(req, res, next, args, 'delete');
};

exports.users_id_property_key_get = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under GET /users/{id}/key
	route_property_key(req, res, next, args, 'get');
};

exports.users_id_property_key_delete = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under DELETE /users/{id}/key
	route_property_key(req, res, next, args, 'delete');
};

exports.users_id_property_key_detail_put = function(req, res, next) {
	const args = req.params;

	// We need to route to get to the correct endpoint, as several fall under PUT /users/{id}/key/detail
	route_property_key_detail(req, res, next, args, 'put');
};
