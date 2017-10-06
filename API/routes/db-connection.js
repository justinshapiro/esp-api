// Setup connection to database
// Any file that needs to work with the db should require this
// Example: var knex = require('./db-connection.js');
module.exports = require('knex')({
        client: 'pg',
        debug:  true,
        connection: {
          host : '127.0.0.1',
          user : 'postgres',
          password : 'seniordesign',
          database : 'postgres'
        },
      });