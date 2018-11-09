'use strict';

// Initialize routes
const express = require('express');
const router = express.Router();

// Get API methods
const locationsEndpoint =    require('./locations');
const notificationEndpoint = require('./notification');
const usersEndpoint =        require('./users');
const authEndpoint =         require('./authentication');

// API Homepage
router.get('/', (req, res) =>
	res.render('index', { title: 'ESP Mobile API' })
);

// Route: /auth... (Local Authentication specific)
router.post('/api/authentication/login', authEndpoint.userLogin);
router.get('/api/authentication/logout', authEndpoint.userLogout);

// Route: /locations...
router.get('/api/locations',                     locationsEndpoint.locations);
router.get('/api/locations/:location_id',        locationsEndpoint.location_with_id);
router.get('/api/locations/:location_id/:photo', locationsEndpoint.location_with_id_photo);


// Route: /notification...
router.post('/api/notification', notificationEndpoint.notification);
router.post('/api/notification/:property', notificationEndpoint.notification_property_post);

// Route: /users...
router.get(   '/api/users',                                 usersEndpoint.users_get);
router.post(  '/api/users',                                 usersEndpoint.users_post);
router.get(   '/api/users/:user_id',                        usersEndpoint.users_id_get);
router.delete('/api/users/:user_id',                        usersEndpoint.users_id_delete);
router.get(   '/api/users/:user_id/:property',              usersEndpoint.users_id_property_get);
router.put(   '/api/users/:user_id/:property',              usersEndpoint.users_id_property_put);
router.post(  '/api/users/:user_id/:property',              usersEndpoint.users_id_property_post);
router.delete('/api/users/:user_id/:property',              usersEndpoint.users_id_property_delete);
router.get(   '/api/users/:user_id/:property/:key',         usersEndpoint.users_id_property_key_get);
router.delete('/api/users/:user_id/:property/:key',         usersEndpoint.users_id_property_key_delete);
router.post(  '/api/users/:user_id/:property/:key',         usersEndpoint.users_id_property_key_post);
router.put(   '/api/users/:user_id/:property/:key/:detail', usersEndpoint.users_id_property_key_detail_put);

module.exports = router;
