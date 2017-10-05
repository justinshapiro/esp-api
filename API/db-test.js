// Setup connection to database
var knex = require('knex')({
    client: 'pg',
    debug:  true,
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'seniordesign',
      database : 'postgres'
    },
  });


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