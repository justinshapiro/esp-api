// Initialize routes
const express = require('express');
const router = express.Router();

// Get API methods
const authorizeEndpoint =    require('./authorize');
const tokenEndpoint =        require('./token');
const locationsEndpoint =    require('./locations');
const notificationEndpoint = require('./notification');
const usersEndpoint =        require('./users');

// API Homepage
router.get('/', function(req, res) {
	res.render('index', { title: 'ESP Mobile API' });
});

// Route: /authorize...
router.get('/api/v1/authorize', authorizeEndpoint.authorize);

// Route: /token...
router.post('/api/v1/token', tokenEndpoint.token);

// Route: /locations...
router.get('/api/v1/locations',              locationsEndpoint.locations);
router.get('/api/v1/locations/:location_id', locationsEndpoint.locations_id);

// Route: /notification...
router.post('/api/v1/notification', notificationEndpoint.notification);

// Route: /users...
router.get(   '/api/v1/users',                                 usersEndpoint.users_get);
router.post(  '/api/v1/users',                                 usersEndpoint.users_post);
router.get(   '/api/v1/users/:user_id',                        usersEndpoint.users_id_get);
router.delete('/api/v1/users/:user_id',                        usersEndpoint.users_id_delete);
router.get(   '/api/v1/users/:user_id/:property',              usersEndpoint.users_id_property_get);
router.put(   '/api/v1/users/:user_id/:property',              usersEndpoint.users_id_property_put);
router.post(  '/api/v1/users/:user_id/:property',              usersEndpoint.users_id_property_post);
router.delete('/api/v1/users/:user_id/:property',              usersEndpoint.users_id_property_delete);
router.get(   '/api/v1/users/:user_id/:property/:key',         usersEndpoint.users_id_property_key_get);
router.delete('/api/v1/users/:user_id/:property/:key',         usersEndpoint.users_id_property_key_delete);
router.put(   '/api/v1/users/:user_id/:property/:key/:detail', usersEndpoint.users_id_property_key_detail_put);

module.exports = router;
