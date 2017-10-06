// Import database connection
var knex = require('./db-connection.js');

// Add test data to authentication_type table and then output entire table
knex('authentication_type')
  .insert({name: 'Internal'})
  .catch(function(error) {
      console.error(error);
  })
  .then(function() {
      return knex('authentication_type').select()
  })
  .then((authentication_types) => {
      console.log(authentication_types);
  });

// Add a user and then output the added user
knex('user_table')
  .insert({authentication_type: 1, authentication_token: 'testauthtoken'})
  .returning('*')
  .then((user) => {
      console.log(user);
  });