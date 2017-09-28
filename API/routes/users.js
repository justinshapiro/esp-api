'use strict';

var responder = require('./httpRouteResponder');

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
	res.send(res.json({
		'Endpoint': 'GET /users'
	}));
};

exports.users_post = function(req, res, next) {
	res.send(res.json({
		'Endpoint': 'POST /users'
	}));
};

exports.users_id_get = function(req, res, next) {
	const arg = req.params.user_id;

	res.send(res.json({
		'Endpoint': 'GET /users/{id}',
		'Args': arg
	}));
};

exports.users_id_delete = function(req, res, next) {
	const arg = req.params.user_id;

	res.send(res.json({
		'Endpoint': 'DELETE /users/{id}',
		'Args': arg
	}));
};

exports.users_id_property_get = function(req, res, next) {
	const args = req.params;

	route_property(req, res, next, args, 'get');
};

exports.users_id_property_put = function(req, res, next) {
	const args = req.params;

	route_property(req, res, next, args, 'put');
};

exports.users_id_property_post = function(req, res, next) {
	const args = req.params;

	route_property(req, res, next, args, 'post');
};

exports.users_id_property_delete = function(req, res, next) {
	const args = req.params;

	route_property(req, res, next, args, 'delete');
};

exports.users_id_property_key_get = function(req, res, next) {
	const args = req.params;

	route_property_key(req, res, next, args, 'get');
};

exports.users_id_property_key_delete = function(req, res, next) {
	const args = req.params;

	route_property_key(req, res, next, args, 'delete');
};

exports.users_id_property_key_detail_put = function(req, res, next) {
	const args = req.params;

	route_property_key_detail(req, res, next, args, 'put');
};
