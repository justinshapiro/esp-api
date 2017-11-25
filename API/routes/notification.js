'use strict';

const twilioSID = 'ACf26ff34933406a3b62b5cac3d017784c';
const twilioAuthToken = '761085ed0c1ab328bfcfbe019d80ef60';

const responder = require('./httpRouteResponder');
const client = require('twilio')(twilioSID, twilioAuthToken);
const CircularJSON = require('circular-json');
const async = require('async');

const usersEndpoint = require('./users');
const locationsEndpoint = require('./locations');

// Route: POST /notification
// Usage: POST /api/v1/notification?
//            user_id={...},
//			  location_id={...},
//            location_type={google, custom}
exports.notification = function(req, res) {
	console.log("/notifications called");
	const user_id = req.query['user_id'];
	const location_id = req.query['location_id'];
	const location_type = req.query['location_type'];

	if (user_id === undefined) {
		responder.raiseQueryError(res, 'user_id');
	} else if (location_id === undefined){
		responder.raiseQueryError(res, 'location_id');
	} else if (location_type === undefined) {
		responder.raiseQueryError(res, 'location_type');
	} else {
		console.log("/notification: Parameters correct");
		usersEndpoint.extern_get_alerts_query(user_id, function(alerts) {
			let alertable = false;
			for (let i = 0; i < alerts[0]['locations']; i++) {
				if (alerts[0]['locations'][i]['location_id'] === location_id) {
					alertable = true;
					break
				}
			}

			if (!alertable) {
				console.log("Location is alertable, proceed");
				// chain the callbacks in parallel
				async.parallel({
					user_name: function (completion) {
						setTimeout(function () {
							usersEndpoint.extern_get_user(user_id, function (user) {
								console.log("Fetched user name: " + user[0]['name']);
								completion(null, user[0]['name']);
							});
						}, 200);
					},
					location_info: function (completion) {
						setTimeout(function () {
							if (location_type === "google") {
								locationsEndpoint.get_location(location_id, function (geoJson) {
									console.log(JSON.stringify(geoJson));
									console.log('Fetched Google location: ' + geoJson['property']['name']);
									completion(null, {
										'location_name': geoJson['GeoJson']['features'][0]['properties']['name'],
										'location_phone_number': geoJson['GeoJson']['features'][0]['properties']['phone_number'],
										'location_type': geoJson['GeoJson']['features'][0]['properties']['category']
									});
								});
							} else if (location_type === "custom") {
								usersEndpoint.extern_get_user_location_id(user_id, location_id, function(geoJson) {
									console.log(JSON.stringify(geoJson));
									console.log('Fetched custom location: ' + geoJson['GeoJson']['features'][0]['properties']['name']);
									completion(null, {
										'location_name': geoJson['GeoJson']['features'][0]['properties']['name'],
										'location_phone_number': geoJson['GeoJson']['features'][0]['properties']['phone_number'],
										'location_type': 'custom emergency location'
									});
								});
							}
						}, 200);
					},
					emergency_contacts: function (completion) {
						setTimeout(function () {
							usersEndpoint.extern_get_contacts(user_id, function (contacts) {
								let all_contacts = [];
								for (let i = 0; i < contacts.length; i++) {
									all_contacts.push(contacts[i]['phone']);
								}

								console.log('Fetched contacts: ' + JSON.stringify(contacts));
								completion(null, all_contacts);
							});
						}, 200);
					}
				}, function(err, results) {
					// handle the result here
					if (err === null) {
						console.log('No errors in call sequence, proceed');
						const user_name = results['user_name'];
						const location_name = results['location_info']['location_name'];
						const location_phone_number = results['location_info']['location_phone_number'];
						const actual_location_type = results['location_info']['location_type'];

						let emergency_contact_numbers = results['emergency_contacts'];
						if (emergency_contact_numbers.length === 1) {
							emergency_contact_numbers = [emergency_contact_numbers];
						}

						console.log('Parsed all required contents, proceed');

						// SMS message contents
						let notify_msg = `ESP ALERT: ${user_name} ` +
						  		         `has entered a ${actual_location_type} ` +
										 `with the name ${location_name}. ` +
						          		 `Contact the location at ${location_phone_number} ` +
										 `for more information.`;

						for (let i = 0; i < emergency_contact_numbers.length; i++) {
							console.log(`Sending notification to contact ${i}`);
							// Send SMS message via Twilio
							client.messages.create({
								to: "+1" + emergency_contact_numbers[i],
								from: "+17204596231", // Twilio specific phone number, do not change
								body: notify_msg,
							}, function (err, message) {
								if (err === null) {
									responder.response(res, CircularJSON.stringify(message));
								} else {
									responder.raiseSMSError(res, err);
								}
							});
						}
					} else {
						console.log('Error in call sequence');
						responder.raiseInternalError(res, err);
					}
				});
			}
		});
	}
};