'use strict';

const responder = require('./httpRouteResponder');
const knex = require('../database/db-connection.js');

// Route to find the correct endpoint whose signature is /users/property
function route_property(req, res, args, method) {
	const property = args['property'];
	const query = req.query;

	switch (property) {
		case 'name':  put_name(args, query, res);  break;
		case 'email': put_email(args, query, res); break;
		case 'contacts': {
			switch (method) {
				case 'get':  get_contacts(args, query, res);  break;
				case 'post': post_contacts(args, query, res); break;
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
				case 'get':    get_alert(args, query, res);    break;
				case 'post':   post_alert(args, query, res);   break;
				case 'delete': delete_alert(args, query, res); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Route to find the correct endpoint whose signature is /users/property/key
function route_property_key(req, res, args, method) {
	const property = args['property'];
	const query = req.query;

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'get':    get_contacts_id(args, query, res);    break;
				case 'delete': delete_contacts_id(args, query, res); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		case 'locations': {
			switch (method) {
				case 'get':    get_locations_id(args, query, res);    break;
				case 'delete': delete_locations_id(args, query, res); break;
				default:       responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Route to find the correct endpoint whose signature is /users/property/key/detail
function route_property_key_detail(req, res, args, method) {
	const property = args['property'];
	const detail = args['detail'];
	const query = req.query;

	switch (property) {
		case 'contacts': {
			switch (method) {
				case 'put': {
					switch (detail) {
						case 'phone': put_contacts_id_phone(args, query, res); break;
						case 'email': put_contacts_id_email(args, query, res); break;
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
						case 'name': put_locations_id_name(args, query, res); break;
						default:     responder.raiseDetailError(res, detail);
					}
				} break;
				default: responder.raiseMethodError(res, method);
			}
		} break;
		default: responder.raisePropertyError(res, property);
	}
}

// Helper method
function geoJsonify(dbResponse) {
	console.log(dbResponse);
	let features = [];

	for (let i = 0; i < dbResponse.length; i++) {
		let rawGeoJson = JSON.parse(dbResponse[i]['geojson']); // this needs to stay 'geojson'
		let lat = rawGeoJson['coordinates'][0];
		let lng = rawGeoJson['coordinates'][1];

		let description = dbResponse[i]['description'];
		let phone_number = dbResponse[i]['phone_number'];
		let address = dbResponse[i]['address'];
		let alertable = dbResponse[i]['alertable'];

		const feature = {
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [lat, lng]
			},
			"properties": {
				"address": address,
				"description": description,
				"phone_number": phone_number,
				"alertable": alertable
			}
		};

		features.push(feature);
	}

	return {
		"GeoJson": {
			"type": "FeatureCollection",
			"features": features
		}
	};
}

function handle_delete_result(result) {
	return {"Rows Deleted": result};
}

// Below is individual methods to implement endpoints that needed to be routed 

// Route: PUT /users/{id}/name
// Usage: PUT /api/v1/users/{id}/name?
// 		  	   name={...}
function put_name(args, query, res) {
	let user_id =  args['user_id'];
	let name =    query['name'];

	if (name === undefined) {
		responder.raiseQueryError(res, 'name')
	} else {
		knex('user_table')
		.where('user_table_id', user_id)
		.update({name: name})
		.returning('*')
		.then((user) => {
			responder.response(res, user);
		})
	}
}

// Route: PUT /users/{id}/email
// Usage: PUT /api/v1/users/{id}/email?
// 		  	   email={...}
function put_email(args, query, res) {
	let user_id =  args['user_id'];
	let email =    query['email'];

	if (email === undefined) {
		responder.raiseQueryError(res, 'email')
	} else {
		knex('user_table')
		.where('user_table_id', user_id)
		.update({email: email})
		.returning('*')
		.then((user) => {
			responder.response(res, user);
		})
	}
}

// Isolated this logic for use elsewhere (to send it through exports)
function get_contacts_db_query(user_id, completion) {
	knex('emergency_contact')
		.select('*')
		.where('user_table_id', user_id)
		.then((contacts) => {
			completion(contacts);
		})
}

// Route: GET /users/{id}/contacts
// Usage: GET /api/v1/users/{id}/contacts
function get_contacts(args, query, res) {
	const user_id = args['user_id'];
	get_contacts_db_query(user_id, function (contacts) {
		responder.response(res, contacts);
	});
}

// Route: POST /users/{id}/contacts
// Usage: POST /api/v1/users/{id}/contacts?
// 		  	   name={...}&
// 			   [email={...}&]
function post_contacts(args, query, res) {
	let user_id =  args['user_id'];
	let name =    query['name'];
	let email =   query['email'];

	if (name === undefined) {
		responder.raiseQueryError(res, 'name')
	} else {
		knex('emergency_contact')
		.insert({
			name: name,
			email: email,
			user_table_id: user_id
		})
		.returning('*')
		.then((contact) => {
			responder.response(res, contact);
		})
	}
}

// Isolated this logic for use elsewhere (to send it through exports)
function get_user_locations_db_query(user_id, category, completion) {
	if (category === null || category === undefined) {
		knex('output_locations')
			.select('*')
			.where('user_table_id', user_id)
			.then((locations) => {
				completion(geoJsonify(locations));
			})
	} else {
		knex('output_locations')
			.select('*')
			.where('user_table_id', user_id)
			.andWhere(knex.raw("(categories -> 0) ->> 'name' = ?", [category]))
			.then((locations) => {
				completion(geoJsonify(locations));
			})
	}
}

// Route: GET /users/{id}/locations
// Usage: GET /api/v1/users/{id}/locations?
// 		  	   [latitude={...}&]
// 			   [longitude={...}&]
//			   [radius={...}&]
//			   [category={...}]
function get_locations(args, query, res) {
	let user_id =  args['user_id'];
	let lat =     query['latitude'];
	let lng =     query['longitude'];
	let rad =     query['radius'];
	let cat =     query['category'];

	let db_query;

	if (lat !== undefined && lng !== undefined && rad !== undefined) {
		db_query =
		knex('output_locations')
		.select('*')
		.where('user_table_id', user_id)
		.andWhere(knex.raw('ST_DWithin(indexed_location, ST_MakePoint(?, ?)::geography, ?)',
							[lat, lng, rad]))
	} else {
		get_user_locations_db_query(user_id, cat, function(locations) {
			responder.response(res, locations)
		});

		return;
	}

	if (cat !== undefined) {
		db_query = db_query.andWhere(knex.raw("(categories -> 0) ->> 'name' = ?", [cat]))
	}

	db_query.then((locations) => {
		responder.response(res, geoJsonify(locations));
	})
}

// Isolated this logic for use elsewhere (to send it through exports)
function get_user_location_id_db_query(user_id, location_id, completion) {
	knex('output_locations')
		.select('*')
		.where('user_table_id', user_id)
		.andWhere('id', location_id)
		.then((location) => {
			completion(geoJsonify(location))
		});
}

// Route: GET /users/{id}/locations/{id}
// Usage: GET /users/{id}/locations/{id}
function get_locations_id(args, query, res) {
	const user_id = args['user_id'];
	const location_id = args['key'];

	if (user_id === undefined) {
		responder.raiseMethodError(res, 'user_id');
	} else if (location_id === undefined) {
		responder.raiseMethodError(res, 'location_id');
	} else {
		get_user_location_id_db_query(user_id, location_id, function(location) {
			responder.response(res, location);
		});
	}
}

// Route: DELETE /users/{id}/locations/{id}
// Usage: DELETE /users/{id}/locations/{id}
function delete_locations_id(args, query, res) {
	let user_id =       args['user_id'];
	let location_id =   args['key'];

	knex('location')
	.where('id', location_id).andWhere('user_table_id', user_id)
	.del()
	.then((result) => {
		responder.response(res, handle_delete_result(result));
	})
}

// Route: POST /users/{id}/locations/{id}/name
// Usage: POST /api/v1/users/{id}/locations/{id}/name?
// 		  	   name={...}
function put_locations_id_name(args, query, res) {
	let name =   query['name'];
	let user_id =    args['user_id'];
	let location_id = args['key'];
	
	if (name === undefined) {
		responder.raiseQueryError(res, 'name')
	} else {
		knex('location')
		.where('id', location_id).andWhere('user_table_id', user_id)
		.update({name: name})
		.returning('*')
		.then((result) => {
			responder.response(res, result);
		})
	}
}

function no_op_query() {
	return knex.raw("SELECT 'NOTHING'");
}

function insert_alertable(user_id, alertable) {
	if (alertable === null) {
		return no_op_query();
	} else {
		return knex.raw('INSERT INTO location_setting VALUES(?, (SELECT loc_id FROM location_insert), ?) ',
		[user_id, alertable]);
	}
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
	let user_id =        args['user_id'];
	let lat =           query['latitude'];
	let lng =           query['longitude'];
	let address =       query['address'];
	let category_type = query['category_type'];
	let description =   query['description'];
	let phone_number =  query['phone_number'];
	let alertable =     query['alertable'];

	// These ifs that set null look like they don't matter, but they are necessary
	// Without them knex gives an error that the bindings aren't defined in null cases
	if (description === undefined) {
		description = null
	}

	if (phone_number === undefined) {
		phone_number = null
	}

	if (alertable === undefined) {
		alertable = null
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
		.with('location_alert', insert_alertable(user_id, alertable))
		.insert({location_id: function() {
			this.select('loc_id').from('location_insert')
		},
			category_id: function() {
			this.select('category.id').from('category').where('name', category_type)
		}})
		.returning('*')
		.then((location_cat) => {
			knex('output_locations')
			.select('*')
			.where('id', location_cat[0].location_id)
			.then((location) => {
				responder.response(res, geoJsonify(location));
			})
		})
	}
}

function get_alert(args, query, res) {
	let user_id = args['user_id'];
	knex('output_user_alerts')
	.select('*')
	.where('user_table_id', user_id)
	.then((alerts) => {
		responder.response(res, alerts);
	})
}

// Route: POST /users/{id}/alert
// Usage: POST /api/v1/users/{id}/alert?
// 		  	   location_id={...}&
// 			   alertable={...}&
function post_alert(args, query, res) {
	let user_id =       args['user_id'];
	let location_id =   query['location_id'];
	let alertable =     query['alertable'];

	if (location_id === undefined) {
		responder.raiseQueryError(res, 'location_id')
	}
	else if (alertable === undefined) {
		responder.raiseQueryError(res, 'alertable')
	}
	else {
		knex('location_setting')
		.insert({
			"user_table_id": user_id,
			"location_id": location_id,
			"alertable": alertable
		})
		.returning('*')
		.then((result) => {
			responder.response(res, result);
		})
	}
}

// Route: POST /users/{id}/alert
// Usage: POST /api/v1/users/{id}/alert?
// 		  	   location_id={...}
function delete_alert(args, query, res) {
	let user_id =       args['user_id'];
	let location_id =   query['location_id'];

	if (location_id === undefined) {
		responder.raiseQueryError(res, 'location_id')
	}
	else {
		knex('location_setting')
		.where('user_table_id', user_id).andWhere('location_id', location_id)
		.del()
		.then((result) => {
			responder.response(res, handle_delete_result(result));
		})
	}
}

function emergency_contact_query(user_id, contact_id) {
	return knex('emergency_contact')
	.where('user_table_id', user_id).andWhere('id', contact_id)
}

// Route: POST /users/{id}/contacts/{id}
// Usage: POST /api/v1/users/{id}/contacts/{id}
function get_contacts_id(args, query, res) {
	let user_id =    args['user_id'];
	let contact_id = args['key'];

	emergency_contact_query(user_id, contact_id)
	.select('*')
	.then((contact) => {
		responder.response(res, contact);
	})
}

// Route: DELETE /users/{id}/contacts/{id}
// Usage: DELETE /api/v1/users/{id}/contacts/{id}
function delete_contacts_id(args, query, res) {
	let user_id =    args['user_id'];
	let contact_id = args['key'];

	emergency_contact_query(user_id, contact_id)
	.del()
	.then((result) => {
		responder.response(res, handle_delete_result(result));
	})
}

// Route: PUT /users/{id}/contacts/{id}/phone
// Usage: PUT /api/v1/users/{id}/contacts/{id}/phone?
// 		  	   phone_number={...}
function put_contacts_id_phone(args, query, res) {
	let phone_number =   query['phone_number'];
	let user_id =    args['user_id'];
	let contact_id = args['key'];
	
	if (phone_number === undefined) {
		responder.raiseQueryError(res, 'phone_number')
	} else {
		emergency_contact_query(user_id, contact_id)
		.update({phone: phone_number})
		.returning('*')
		.then((result) => {
			responder.response(res, result);
		})
	}
}

// Route: PUT /users/{id}/contacts/{id}/email
// Usage: PUT /api/v1/users/{id}/contacts/{id}/email?
// 		  	   email={...}
function put_contacts_id_email(args, query, res) {
	let email_addr =   query['email'];
	let user_id =    args['user_id'];
	let contact_id = args['key'];
	
	if (email_addr === undefined) {
		responder.raiseQueryError(res, 'email')
	} else {
		emergency_contact_query(user_id, contact_id)
		.update({email: email_addr})
		.returning('*')
		.then((result) => {
			responder.response(res, result);
		})
	}
}

function get_users() {
	return knex('user_table')
	.distinct('user_table.user_table_id', 'user_table.authentication_token',
			'user_table.name', 'authentication_type.name as auth_type',
			'internal_authentication.username', 'internal_authentication.password')
	.join('authentication_type', 'user_table.authentication_type', 'authentication_type.id')
	.leftJoin('internal_authentication', 'user_table.user_table_id', 'internal_authentication.user_table_id')
	.select();
}

// Isolated this logic for use elsewhere (to send it through exports)
function get_all_users_query(completion) {
	get_users().then((users) => {
		console.log(users);
		completion(users);
	})
}

// Route: GET /users
// Usage: GET /api/v1/users
exports.users_get = function(req, res) {
	// No need to route further, continue logic here

	get_all_users_query(function(users) {
		responder.response(res, users);
	})
};

function add_user(auth_type, token, name) {
	return knex('user_table').insert({
		authentication_type: auth_type,
		authentication_token: token,
		name: name
	}).returning('*');
}

// Route: POST /users
// Usage: POST /api/v1/users?
//             authentication_type={...}&
//			   [authentication_token={...}&]
//             [name={...}]
exports.users_post = function(req, res, next) {
	// No need to route further, continue logic here
  
	const name =      req.query['name'];
	const auth_type = req.query['authentication_type'];
	const token =     req.query['authentication_token'];

	if (auth_type === undefined) {
		responder.raiseQueryError(res, 'authentication_type');
	} else {
		add_user(auth_type, token, name).then((user) => {
			responder.response(res, user)
		});
	}
};

// Isolated this logic for use elsewhere (to send it through exports)
function get_user_db_query(user_id, completion) {
	get_users()
		.where('user_table.user_table_id', user_id)
		.then((user) => {
			completion(user);
		})
}

// Route: GET /users/{id}
// Usage: GET  /api/v1/users/{id}
exports.users_id_get = function(req, res) {
	const user_id = req.params['user_id'];

	get_user_db_query(user_id, function(user) {
		responder.response(res, user);
	});
};

// Route: DELETE  /users/{id}
// Usage: DELETE  /api/v1/users/{id}
exports.users_id_delete = function(req, res) {
	const user_id = req.params['user_id'];

	knex('user_table')
	.where('user_table_id', user_id)
	.del()
	.then((result) => {
		responder.response(res, result);
	})
};

exports.users_id_property_get = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under GET /users/{id}
	route_property(req, res, args, 'get');
};

exports.users_id_property_put = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under PUT /users/{id}
	route_property(req, res, args, 'put');
};

exports.users_id_property_post = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under POST /users/{id}
	route_property(req, res, args, 'post');
};

exports.users_id_property_delete = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under DELETE /users/{id}
	route_property(req, res, args, 'delete');
};

exports.users_id_property_key_get = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under GET /users/{id}/key
	route_property_key(req, res, args, 'get');
};

exports.users_id_property_key_delete = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under DELETE /users/{id}/key
	route_property_key(req, res, args, 'delete');
};

exports.users_id_property_key_detail_put = function(req, res) {
	const args = req.params;

	// TODO: if (req.user) { proceed with call } else { unauthorized }

	// We need to route to get to the correct endpoint, as several fall under PUT /users/{id}/key/detail
	route_property_key_detail(req, res, args, 'put');
};

// Here we export functions that other parts of the API will need
exports.extern_get_contacts = get_contacts_db_query;
exports.extern_get_user = get_user_db_query;
exports.extern_get_all_users = get_all_users_query;
exports.extern_get_user_locations = get_user_locations_db_query;
exports.extern_get_user_location_id = get_user_location_id_db_query;