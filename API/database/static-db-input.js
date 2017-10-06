// Import database connection
var knex = require('./db-connection.js');

// Add a row to authentication_type table so that user's can be created
knex('authentication_type')
  .insert({name: 'Internal'})
  .tap(console.log);

// Add categories so that locations can be created