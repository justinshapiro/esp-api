// Import database connection
var knex = require('./db-connection.js');

// Add a row to authentication_type table so that user's can be created
function add_authentication_type() {
    return knex('authentication_type')
    .insert({id: 1, name: 'Internal'})
}

// Add a 'default' user with nil uuid
// Anything added without a user must link back to this user
function add_default_user() {
    return knex('user_table')
    .insert({user_table_id: knex.raw('uuid_nil()'),
            authentication_type: 1,
            authentication_token: "default"})
}

// Add categories so that locations can be created
function add_categories() {
    return knex('category')
    .insert([
    {name: "Hospital",
    description: "Where people go to get healed"},
    {name: "Police Dept",
    description: "Where people go when there’s trouble"},
    {name: "Fire Dept",
    description: "Where all the fire trucks are"}])
}

// Run the functions in the necessary order to fit constraints
Promise.resolve()
    .then(add_authentication_type)
    .then(add_default_user)
    .then(add_categories);