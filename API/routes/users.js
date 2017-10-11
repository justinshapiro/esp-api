'use strict';

const responder = require('./httpRouteResponder');
const knex = require('../database/db-connection.js');

// Route to find the correct endpoint whose signature is /users/property
function route_property(req, res, next, args, method) {
	const property = args['property'];
	const query = req.query;

	switch (property) {
		case 'name':  responder.response(res, put_name(args, query));  break;
		case 'email': responder.response(res, put_email(args, query)); break;
		case 'phone': responder.response(res, put_phone(args, query)); break;
		case 'contacts': {
			switch (method) {
				case 'get':  responder.response(res, get_contacts(args, query));  break;
				case 'post': responder.response(res, post_contacts(args, query)); break;
				default:     responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'get':  get_locations(args, query, res);  break;
				case 'post': post_locations(args, query, res); break;
				default:     responder.raiseMethodError(res, method);
			}
		} break;
		case 'alert': {
			switch (method) {
				case 'get':    responder.response(res, get_alert(args, query));    break;
				case 'post':   responder.response(res, post_alert(args, query));   break;
				case 'delete': responder.response(res, delete_alert(args, query)); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Route to find the correct endpoint whose signature is /users/property/key
function route_property_key(req, res, next, args, method) {
	const property = args['property'];
	const query = req.query;

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'get':    responder.response(res, get_contacts_id(args, query));    break;
				case 'delete': responder.response(res, delete_contacts_id(args, query)); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'get':    responder.response(res, get_locations_id(args, query));    break;
				case 'delete': responder.response(res, delete_locations_id(args, query)); break;
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
	const query = req.query;

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'put': {
					switch (detail) {
						case 'phone': responder.response(res, put_contacts_id_phone(args, query)); break;
						case 'email': responder.response(res, put_contacts_id_email(args, query)); break;
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
						case 'name': responder.response(res, put_locations_id_name(args, query)); break;
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
function put_name(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/name',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function put_email(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/email',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function put_phone(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/phone',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function get_contacts(args, query) {
	const data = {
		'Endpoint': 'GET /users/{id}/contacts',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function post_contacts(args, query) {
	const data = {
		'Endpoint': 'POST /users/{id}/contacts',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

// Route: GET /users/{id}/locations
// Usage: GET /api/v1/users/{id}/locations
function get_locations(args, query, res) {
	let user_id = args['user_id'];

	knex('output_locations')
	.select('*')
	.where('user_table_id', user_id)
	.then((locations) => {
		responder.response(res, locations);
	})
}

// Route: POST /users/{id}/locations
// Usage: POST /api/v1/users/{id}/locations?
// 		  	   latitude={...}&
// 			   longitude={...}&
//             address={...}&
//             category_name={...}&
//             [description={...}&]
//             [phone_number={...}&]
function post_locations(args, query, res) {
	let user_id =       args['user_id'];
	let lat =           query['latitude'];
	let lng =           query['longitude'];
	let address =       query['address'];
	let category_type = query['category_type'];
	let description =   query['description'];
	let phone_number =  query['phone_number'];

	// These ifs that set null look like they don't matter, but they are necessary
	// Without them knex gives an error that the bindings aren't defined in null cases
	if (description === undefined) {
		description = null
	}
	if (phone_number === undefined) {
		phone_number = null
	}
	if (address === undefined) {
		responder.raiseQueryError(res, 'address')
	}
	else if (lat === undefined) {
		responder.raiseQueryError(res, 'latitude')
	}
	else if (lng === undefined) {
		responder.raiseQueryError(res, 'longitude')
	}
	else if (category_type === undefined) {
		responder.raiseQueryError(res, 'category_type')
	}
	else {
		knex('location_category')
		.with('location_insert', knex.raw('INSERT INTO location(description, phone_number, address, lat, long, user_table_id)\
											 VALUES(?, ?, ?, ?, ?, ?) RETURNING location.id as loc_id',
											[description, phone_number, address, lat, lng, user_id]))
		.insert({location_id: function() {
			this.select('loc_id').from('location_insert')
		},
			category_id: function() {
			this.select('category.id').from('category').where('name', category_type)
		}})
		.returning('*')
		.then((location) => {
			responder.response(res, location);
		})
	}
}

function get_alert(args, query) {
	const data = {
		'Endpoint': 'GET /users/{id}/alert',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function post_alert(args, query) {
	const data = {
		'Endpoint': 'POST /users/{id}/alert',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function delete_alert(args, query) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/alert',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function get_contacts_id(args, query) {
	const data = {
		'Endpoint': 'GET /users/{id}/contacts/{id}',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function delete_contacts_id(args, query) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/contacts/{id}',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function get_locations_id(args, query) {
	const data = {
		'Endpoint': 'GET /users/{id}/locations/{id}',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function delete_locations_id(args, query) {
	const data = {
		'Endpoint': 'DELETE /users/{id}/locations/{id}',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function put_contacts_id_phone(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/contacts/{id}/phone',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function put_contacts_id_email(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/contacts/{id}/email',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function put_locations_id_name(args, query) {
	const data = {
		'Endpoint': 'PUT /users/{id}/locations/{id}/name',
		'Args': args,
		'Query Parameters': query
	};

	return data;
}

function get_users() {
	return knex('user_table')
	.select('user_table.user_table_id', 'user_table.authentication_token', 
			'user_table.name', 'authentication_type.name as auth_type',
			'internal_authentication.username', 'internal_authentication.password')
	.join('authentication_type', 'user_table.authentication_type', 'authentication_type.id')
	.leftJoin('internal_authentication', 'user_table.user_table_id', 'internal_authentication.user_table_id');
}

exports.users_get = function(req, res, next) {
	// No need to route further, continue logic here

	get_users().then((users) => {
		responder.response(res, users);
	})
};

function add_user(auth_type, token, name) {
	return knex('user_table')
	.insert({authentication_type: auth_type, 
			authentication_token: token,
			name: name})
	.returning('*');
}

// Route: POST /users
// Usage: POST /api/v1/users?
//             authentication_type={...}&
//			   [authentication_token={...}&]
//             [name={...}]
exports.users_post = function(req, res, next) {
	// No need to route further, continue logic here
  
	const name = req.query.name;
	const auth_type = req.query.authentication_type;
	const token = req.query.authentication_token;

	if (auth_type === null) {
		responder.raiseQueryError(res, 'authentication_type');
	} else {
		add_user(auth_type, token, name).then((user) => {
			responder.response(res, user)
		});
	}
};

exports.users_id_get = function(req, res, next) {
	// No need to route further, continue logic here

	const arg = req.params.user_id;

	get_users()
	.where('user_table.user_table_id', arg)
	.then((user) => {
		responder.response(res, user);
	})
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
