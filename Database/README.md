# Database for esp-api

PostgreSQL implementation

## Installing the database
1. Install PostgreSQL from here: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads#windows
2. Use the default options on install (use password seniordesign)
3. Launch stackbuilder at the end of setup.
4. Stack Builder: Choose your postgres installation from the dropdown.
5. Under spatial extensions, check PostGIS 2.4 Bundle and proceed with install (use default options everywhere).
6. Choose Yes all three times when pop ups come up asking questions.
7. Add postgres to your path:
```
My Computer->Properties->Advanced System Settings->EnvironmentVariables->Path->Edit
Add these two folders:
C:\Program Files\PostgreSQL\9.6\bin
C:\Program Files\PostgreSQL\9.6\lib
```

## Loading your local database with current state
1. Open a command prompt from the folder containing this readme
2. Type ```psql -U postgres postgres < current_state.sql```

## Saving your changes
1. Open a command prompt from the folder containing this readme
2. Type ```pg_dump -U postgres --clean postgres > current_state.sql```
3. Commit and push the updated current_state.sql file