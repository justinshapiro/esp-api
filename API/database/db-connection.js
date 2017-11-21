// Setup connection to database
// Any file that needs to work with the db should require this
// Example: var knex = require('./db-connection.js');
module.exports = require('knex')({
	client: 'pg',
	debug:  true,
	connection: {
		// How to set host:
		//  - 127.0.0.1 for local testing
		//  - 35.202.119.248 to locally use hosted db on Cloud SQL (may not work if you have the Cloud SQL proxy running)
		//  - /cloudsql/esp-mobile-182605:us-central1:esp-db to deploy to App Engine (production)
		//  - change 'database' to 'postgres' when deploying
		host : '127.0.0.1',
		// user, password, and database remain unchanged regardless of local, develop or production scenarios
		user: 'postgres',
		password: 'seniordesign',
		database: 'esp_db'
	}
});