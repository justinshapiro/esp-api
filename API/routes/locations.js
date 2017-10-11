'use strict';

const responder = require('./httpRouteResponder');
const mapsAPI = require('../maps-api/maps');

// Route: GET /locations
// Usage: GET /api/v1/locations?
//            latitude={...}&
//            longitude={...}&
//            radius{...}&
//            category{...}
exports.locations = function(req, res) {
	const latitude =  req.query['latitude'];
	const longitude = req.query['longitude'];
	const radius =    req.query['radius'];
	const category =  req.query['category'];

	if (latitude === undefined) {
		responder.raiseQueryError(res, 'latitude');
	} else if (longitude === undefined) {
		responder.raiseQueryError(res, 'longitude');
	} else if (radius === undefined) {
		responder.raiseQueryError(res, 'radius');
	} else if (category === undefined) {
		responder.raiseQueryError(res, 'category');
	} else {
		mapsAPI.places(latitude, longitude, parseInt(radius), category, function(locations) {
			responder.response(res, geoJsonify(locations));
		});
	}
};

// Route: GET /locations/{id}
// Usage: GET /api/v1/locations/{id}
exports.locations_id = function(req, res) {
	const location_id = req.params['location_id'];

	mapsAPI.getPlace(location_id, function(placeDetails) {
		responder.response(res, geoJsonify(placeDetails));
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
	const lat = json['geometry']['location']['lat'];
	const lng = json['geometry']['location']['lng'];
	const name = json['name'];
	const address = json['vicinity'];
	const location_id = json['place_id'];

	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [lat, lng]
		},
		"properties": {
			"name": name,
			"address": address,
			"location_id": location_id
		}
	};
}