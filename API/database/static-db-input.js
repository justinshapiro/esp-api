// Import database connection
const knex = require('./db-connection.js');

// Add a row to authentication_type table so that users can be created
function add_authentication_type() {
    return knex('authentication_type')
    .insert({id: 1, name: 'Internal'})
    .catch(friendly_error_print)
}

// Add a 'default' user with nil uuid
// Anything added without a user must link back to this user
function add_default_user() {
    return knex('user_table')
    .insert({user_table_id: knex.raw('uuid_nil()'),
            authentication_type: 1,
            authentication_token: "default",
            name: "default"})
    .catch(friendly_error_print)
}

// Add categories so that locations can be created
function add_categories() {
    return knex('category')
    .insert([
    {name: "hospital",
    description: "Where people go to get healed"},
    {name: "police",
    description: "Where people go when there’s trouble"},
    {name: "fire_station",
    description: "Where all the fire trucks are"}])
    .catch(friendly_error_print)
}

function friendly_error_print(error) {
    console.error("PostgreSQL Error: " + error.detail);
}

// Run the functions in the necessary order to fit constraints
Promise.resolve()
    .then(add_authentication_type)
    .then(add_default_user)
    .then(add_categories);