'use strict';

const responder = require('./httpRouteResponder');
const mapsAPI = require('../maps-api/maps');
const async = require('async');

const usersEndpoint = require('./users');

// Route: GET /locations
// Usage: GET /api/v1/locations?
//            latitude={...}&
//            longitude={...}&
//            radius={...}&
//            [user_id={...}]
exports.locations = function(req, res) {
	const latitude =  req.query['latitude'];
	const longitude = req.query['longitude'];
	const radius =    req.query['radius'];
	let user_id =     req.query['user_id'];

	if (user_id === undefined) {
		user_id = null;
	}

	if (latitude === undefined) {
		responder.raiseQueryError(res, 'latitude');
	} else if (longitude === undefined) {
		responder.raiseQueryError(res, 'longitude');
	} else if (radius === undefined) {
		responder.raiseQueryError(res, 'radius');
	} else {
		let responses = [];
		const categories = ["hospital", "police", "fire_station"];
		categories.forEach(function(category) {
			responses.push(function(completion) {
				setTimeout(function() {
					mapsAPI.places(latitude, longitude, parseInt(radius), category, function (locations) {
						completion(null, geoJsonify(locations)['GeoJson']['features']);
					});
				}, 200);
			})
		});

		if (user_id !== null) {
			responses.push(function(completion) {
				setTimeout(function() {
					usersEndpoint.extern_get_user_locations(user_id, null, function(locations) {
						completion(null, locations['GeoJson']['features']);
					});
				});
			});
		}

		async.parallel(responses, function(err, results) {
			responder.response(res, {
				"GeoJson": {
					"type": "FeatureCollection",
					"features": [].concat.apply([], results)
				}
			});
		});
	}
};

// Isolated this logic for use elsewhere (to send it through exports)
function get_google_location(location_id, completion) {
	mapsAPI.getPlace(location_id, function(placeDetails) {
		completion(geoJsonify(placeDetails));
	});
}

// Route: GET /locations/{id}
// Usage: GET /api/v1/locations/{id}
exports.locations_id = function(req, res) {
	const location_id = req.params['location_id'];

	get_google_location(location_id, function (geoJson) {
		responder.response(res, geoJson);
	});
};

// Helper functions
function geoJsonify(mapsResponse) {
	if (mapsResponse.json['results'] === undefined) {
		return getFeature(mapsResponse.json['result'])
	}

	const results = mapsResponse.json['results'];

    let features = [];
    for (let i = 0; i < results.length; i++) {
        features.push(getFeature(results[i]));
    }

    return {
        "GeoJson": {
        	"type": "FeatureCollection",
        	"features": features
    	}
    };
}

function getFeature(json) {
	const lat =          json['geometry']['location']['lat'];
	const lng =          json['geometry']['location']['lng'];
	const name =         json['name'];
	const address =      json['vicinity'];
	const location_id =  json['place_id'];
	const phone_number = json['formatted_phone_number'];
	let   category =     json['types'][0];
	
	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [lat, lng]
		},
		"properties": {
			"name": name,
			"address": address,
			"phone_number": phone_number,
			"category": category,
			"location_id": location_id
		}
	};
}

// Here we export functions that other parts of the API will need
exports.get_location = get_google_location;