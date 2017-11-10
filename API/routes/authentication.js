'use strict';

const responder = require('./httpRouteResponder');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const usersEndpoint = require('./users');

// Define a local authentication Passport strategy here
passport.use(new LocalStrategy(
	function(login_id, password, auth_response) {
		usersEndpoint.extern_get_all_users(function(users) {
			let user_id = null;
			let db_password = null;
			for (let i = 0; i < users.length; i++) {
				if (login_id === users[i]['username'] || login_id === users[i]['email']) {
					user_id = users[i]['user_table_id'];
					db_password = users[i]['password'];
					break;
				}
			}

			if (user_id === null) {
				return auth_response(null, false)
			} else {
				if (password === db_password) {
					return auth_response(null, user_id);
				} else {
					return auth_response(null, false);
				}
			}
		});
	})
);

// Route: POST /auth/login
// Usage: POST /api/v1/auth/login?
//             username={...}&
//			   password={...}
exports.userLogin = function(req, res, next) {
	// passport gets the query parameters from LocalStrategy
	// passport will handle responding with 200 or 401
	passport.authenticate('local')(req, res, next);
};

// Route: GET /auth/logout
// Usage: GET /api/v1/logout
exports.userLogout = function(req, res) {
	req.logout();
	responder.response(res, "Logout successful"); // may not need this
};

// after a user has logged in, they will be in req.user for each Express request
// so we verify authentication by checking req.user at an endpoint
// we can do this simply by checking once at the /users/{id] endpoint roots