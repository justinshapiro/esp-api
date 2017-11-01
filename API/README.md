# esp-api

Repo for the Emergency Location and Emergency Notification APIs, along with the supporting database.

## Running the API locally:
1. `cd esp-api\API`
2. Run `npm install`
3. Run `npm start`
4. `http://localhost:3000` shows API homepage
5. All endpoints are queried at `http://localhost:3000/api/v1/` or `http://www.espmobile.org/api/v1`

## Implementing Endpoints (dev)
Endpoint roots are defined as follows:
1. `/authorize` (implemented in `routes/authorize.js`)
2. `/token` (implemented in `routes/token.js`)
3. `/locations` (implemented in `routes/locations.js`)
4. `/notification` (implemented in `routes/notification.js`)
5. `/users` (implemented in `routes/users.js`)

These endpoints support any of the following HTTP methods:
1. `GET` (ask the API to return data)
2. `PUT` (ask the API to update hosted data)
3. `POST` (ask the API to create a new data item to be hosted)
4. `DELETE` (ask the API to delete hosted data)

Each HTTP method needs to have its own implementation by calling `router.{HTTP_METHOD}`. This is called in `routes/index.js` and the appropriate *exported function* is referenced to complete the implementation.

More than one endpoint may fall under a given root. These are called *nested endpoints*. Because of this, we need to use a routing mechanism to call the correct function. We see this mainly in `/users`. Nested endpoints are navigated to by calling the **argument** (`req.params`). Once at a given endpoint, **query parameters** are accessed with `req.query`.

Nested arguments are routing using the following enumeration of names:

- `root/root_argument`
- `root/root_argument/property`
- `root/root_argument/key`
- `root/root_argument/key/detail`

For `/users`, the `root_argument` is always `user_id`.

## API Documentation / Test Suite
Documentation of the API endpoints is located at https://documenter.getpostman.com/view/553180/esp-api/77eARDe

To run test suite click this button: [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/184c09968390baf8b27e#?env%5BAPI%20Test%20Run%5D=W3sidHlwZSI6InRleHQiLCJlbmFibGVkIjp0cnVlLCJrZXkiOiJ1c2VyX2lkIiwidmFsdWUiOiIifV0=)

## Deployment

The API and database are hosted on Google Cloud Platform's App Engine. Deployment is simple and follows the following steps:
0. Install Google Cloud SDK
1. Stop any running instances of the API in the Google Cloud Platform Console
1. `cd` to API directory
2. Execute `gcloud app deploy`
3. Update the database with the command `psql "sslmode=disable host=/cloudsql/esp-mobile-182605:us-central1:esp-db user=postgres" esp_db < current_state.sql`

