'use strict';

const responder = require('./httpRouteResponder');
const mapsAPI = require('../maps-api/maps');
const async = require('async');
const usersEndpoint = require('./users');

// Route: GET /locations
// Usage: GET /api/v1/locations?latitude={...}&longitude={...}&radius={...}&[user_id={...}]
exports.locations = function(req, res) {
    const parameters = {
        'latitude': req.query['latitude'],
        'longitude': req.query['longitude'],
        'radius': req.query['radius']
    };

    if (!responder.handleMissingParameters(res, parameters)) {
        const latitude = parameters.latitude;
        const longitude = parameters.longitude;
        const radius = parameters.radius;

        let responses = [];

        ["hospital", "police", "fire_station"].forEach(category =>
            responses.push(completion => setTimeout(() =>
                mapsAPI.places(latitude, longitude, parseInt(radius), category, locations =>
                    completion(null, locations)
                ), 200)
            )
        );

        const user_id = req.query['user_id'];
        if (user_id !== undefined) {
            responses.push(completion => setTimeout(() =>
                usersEndpoint.extern_get_user_locations_with_location(user_id, latitude, longitude, radius, undefined, locations =>
                    completion(null, locations['GeoJson']['features'])
                ), 200)
            )
        }

        // wait for 3-4 calls to complete
        // (locations for hospitals, police stations, and fire stations and possibly user defined locations)
        async.parallel(responses, (err, locations) => {
            if (err === null) {
                let phoneNumberRequestsLocations = [];

                [].concat.apply([], locations).forEach(result =>
                    result['json']['results'].forEach(location =>
                        phoneNumberRequestsLocations.push(completion => setTimeout(() =>
                            mapsAPI.getPlace(location['place_id'], place =>
                                completion(null, place['json']['result'])
                            ), 200)
                        )
                    )
                );

                // wait for N calls to complete, where N is the number of locations to get a phone number for
                async.parallel(phoneNumberRequestsLocations, (err, places) => {
                    if (err === null) {
                        const formedResponses = locations.map(location => locationArray(location, places));
                        responder.responseSuccess(res, [].concat.apply([], formedResponses));
                    } else {
                        responder.responseFailed(res, err);
                    }
                });
            } else {
                responder.responseFailed(res, err);
            }
        });
    }
};

// Route: GET /locations/{id}
// Usage: GET /api/v1/locations/{id}
exports.location_with_id = function(req, res) {
    const locationId = req.params['location_id'];

    if (locationId !== undefined) {
        setTimeout(() =>
            mapsAPI.getPlace(locationId, place => {
                responder.responseSuccess(res, locationObject(place['json']['result'], null));
            }), 200
        );
    } else {
        responder.apiMisconfiguration(res)
    }
};

// Route: GET /locations/photo
// Usage: GET /api/v1/locations/{id}/photo
exports.location_with_id_photo = function(req, res) {
    const locationId = req.params['location_id'];

    if (locationId !== undefined) {
        if (req.params['photo'] !== undefined) {
            mapsAPI.getPlace(locationId, place => setTimeout(() => {
                const placePhotos = place['json']['result']['photos'];

                if (placePhotos !== undefined &&
                    placePhotos.length > 0 &&
                    placePhotos[0]['photo_reference'] !== undefined) {
                    setTimeout(() =>
                        mapsAPI.getPhoto(placePhotos[0]['photo_reference'], photo => photo.pipe(res)), 200
                    )
                } else {
                    responder.resourceNotFound(res, 'photo')
                }
            }))
        } else {
            responder.responseFailed(res, "Endpoint requested is not valid")
        }
    } else {
        responder.apiMisconfiguration(res)
    }
};

// Helper functions
function locationArray(mapsResponse, places) {
    return mapsResponse['json']['results']
        .map(mapsLocation => locationObject(mapsLocation, places))
}

function locationObject(mapsLocation, places) {
    const locationId = mapsLocation['place_id'];

    const phoneNumber = () => {
        if (places !== null) {
            const phoneNumber = places.find(place => place['place_id'] === locationId)['formatted_phone_number'];
            return phoneNumber !== undefined ? phoneNumber : null;
        } else {
            const phoneNumber = mapsLocation['formatted_phone_number'];
            return phoneNumber !== undefined ? phoneNumber : null
        }
    };

    return {
        "location_id": locationId,
        "name": mapsLocation['name'],
        "address": mapsLocation['vicinity'],
        "phone_number": phoneNumber(),
        "category": mapsLocation['types'][0],
        "coordinates": {
            "latitude": mapsLocation['geometry']['location']['lat'],
            "longitude": mapsLocation['geometry']['location']['lng']
        }
    }
}