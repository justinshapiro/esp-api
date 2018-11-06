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
    const parameters = {
        'latitude':  req.query['latitude'],
        'longitude': req.query['longitude'],
        'radius':    req.query['radius']
    };

    if (!responder.handleMissingParameters(res, parameters)) {
        const latitude = parameters.latitude;
        const longitude = parameters.longitude;
        const radius = parameters.radius;

        let responses = [];

        ["hospital", "police", "fire_station"].forEach(category =>
            responses.push(completion =>
                setTimeout(_ =>
                    mapsAPI.places(latitude, longitude, parseInt(radius), category, locations =>
                        completion(null, locations)
                    )
            ,200)
            )
        );

        let user_id = req.query['user_id'];
        if (user_id !== undefined) {
            responses.push(completion =>
                setTimeout(_ =>
                    usersEndpoint.extern_get_user_locations_with_location(user_id, latitude, longitude, radius, undefined, locations =>
                        completion(null, locations['GeoJson']['features'])
                    )
            ,200)
            )
        }

        async.parallel(responses, (err, locations) => {
            if (err !== null) {
                responder.responseFailed(res, err);
            } else {
                let phoneNumberRequestsLocations = [];

                [].concat.apply([], locations).forEach(result =>
                    result['json']['results'].forEach(location =>
                        phoneNumberRequestsLocations.push(completion =>
                            mapsAPI.getPlace(location['place_id'], place =>
                                completion(null, {
                                    'location_id': location['place_id'],
                                    'phone_number': place['json']['result']['formatted_phone_number']
                                })
                            )
                        )
                    )
                );

                async.parallel(phoneNumberRequestsLocations, (err, locationInfo) => {
                    if (err !== null) {
                        responder.responseFailed(res, err);
                    } else {
                        const formedResponses = locations.map(location => locationArray(location, locationInfo));
                        responder.responseSuccess(res, [].concat.apply([], formedResponses));
                    }
                });
            }
        });
    }
};

// Isolated this logic for use elsewhere (to send it through exports)
function get_google_location(location_id, completion) {
	mapsAPI.getPlace(location_id, function(placeDetails) {
		completion(geoJsonify(placeDetails))
	})
}

exports.locations_property_get = function(req, res) {
	const property = req.params['property'];

	if (property === 'photo') {
		locations_photo(req, res)
	} else {
		locations_id(req, res)
	}
};

// Route: GET /locations/{id}
// Usage: GET /api/v1/locations/{id}
function locations_id(req, res) {
	const location_id = req.params['property'];

	get_google_location(location_id, function (geoJson) {
		responder.response(res, geoJson)
	})
}

// Route: GET /locations/photo
// Usage: GET /api/v1/locations/photo?
//            photo_ref={...}
function locations_photo(req, res) {
	const photo_ref = req.query['photo_ref'];

	if (photo_ref === undefined) {
		responder.raiseQueryError(res, 'photo_ref')
	} else {
		mapsAPI.getPhoto(photo_ref, function(photo) {
			photo.pipe(res)
		})
	}
}

// Helper functions
function locationArray(mapsResponse, locationInfo) {
    return mapsResponse['json']['results'].map(mapsLocation => {
        const locationId = mapsLocation['place_id'];
        const phoneNumber = locationInfo.find(info => info['location_id'] === locationId)['phone_number'];

        return {
            "name":          mapsLocation['name'],
            "address":       mapsLocation['vicinity'],
            "phone_number":  phoneNumber !== undefined ? phoneNumber : null,
            "coordinates": {
                "latitude":  mapsLocation['geometry']['location']['lat'],
                "longitude": mapsLocation['geometry']['location']['lng']
            },
            "category":      mapsLocation['types'][0],
            "location_id":   locationId,
            "photo_ref":     mapsLocation['photos'] !== undefined ? mapsLocation['photos'][0]['photo_reference'] : null
        }
    })
}
function geoJsonify(mapsResponse) {
	if (mapsResponse.json['results'] === undefined) {
		return getFeature(mapsResponse.json['result'])
	}

	const results = mapsResponse.json['results'];

    let features = [];
    for (let i = 0; i < results.length; i++) {
        features.push(getFeature(results[i]))
    }

    return {
        "GeoJson": {
        	"type": "FeatureCollection",
        	"features": features
    	}
    }
}

function getFeature(json) {
	const lat =          json['geometry']['location']['lat'];
	const lng =          json['geometry']['location']['lng'];
	const name =         json['name'];
	const address =      json['vicinity'];
	const location_id =  json['place_id'];
	const phone_number = json['formatted_phone_number'];
	let   category =     json['types'][0];

	let photo_ref;
	if (json['photos'] !== undefined) {
		photo_ref = json['photos'][0]['photo_reference']
	}

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
			"location_id": location_id,
			"photo_ref": photo_ref
		}
	}
}

// Here we export functions that other parts of the API will need
exports.get_location = get_google_location;