// Import database connection
var knex = require('./db-connection.js');

// Add a row to authentication_type table so that user's can be created
knex('authentication_type')
    .insert({name: 'Internal'})
    .tap(console.log);

// Add categories so that locations can be created
knex('category')
    .insert([
    {name: "Hospital",
    description: "Where people go to get healed"},
    {name: "Police Dept",
    description: "Where people go when there’s trouble"},
    {name: "Fire Dept",
    description: "Where all the fire trucks are"}])
    .tap(console.log);