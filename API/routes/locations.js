'use strict';

const responder = require('./httpRouteResponder');
const mapsAPI = require('../maps-api/maps');

// Route: /locations
// Usage: /api/v1/locations?latitude={...}&longitude={...}&radius{...}&category{...}
exports.locations = function(req, res, next) {
	const latitude = req.query.latitude;
	const longitude = req.query.longitude;
	const radius = req.query.radius;
	const category = req.query.category;

	if (latitude === null) {
		responder.raiseQueryError(res, 'latitude');
	} else if (longitude === null) {
		responder.raiseQueryError(res, 'longitude');
	} else if (radius === null) {
		responder.raiseQueryError(res, 'radius');
	} else if (category === null) {
		responder.raiseQueryError(res, 'category');
	} else {
		mapsAPI.places(latitude, longitude, parseInt(radius), category, function(locations) {
			responder.response(res, geoJsonify(locations));
		});
	}
};

// Route: /locations/{id}
exports.locations_id = function(req, res, next) {
	const arg = req.params.location_id;

	responder.response(res, {
		'Endpoint': 'GET /locations/{id}',
		'Args': arg
	});
};

function geoJsonify(mapsResponse) {
    const results = mapsResponse.json['results'];

    let features = [];
    for (let i = 0; i < results.length; i++) {
        const lat = results[i]['geometry']['location']['lat'];
        const lng = results[i]['geometry']['location']['lng'];
        const name = results[i]['name'];
        const address = results[i]['vicinity'];

        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lat, lng]
            },
            "properties": {
                "name": name,
                "address": address
            }
        };
        features.push(feature);
    }

    const geoJson = {
        "GeoJson": {
        	"type": "FeatureCollection",
        	"features": features
    	}
    };

    return geoJson;
}