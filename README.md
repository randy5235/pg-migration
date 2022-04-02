# PG-Migrations

:triangular_flag_on_post:	Currently still being built, use may change slightly until version 1.0.0 is hit, then I will default to semantic versioning as expected. :triangular_flag_on_post:	


I built this package after realizing that I had written or reimplemented this code on several occasions. I decided for the purpose observability to not add a way to remove patches. If you need to revert, you should fail forward by adding a new patch to undo the previous changes. 

The purpose of this it to allow a history of the db schema and "state" to exist in version control.

## [Installation](#Installation)
```shell
$ npm install pg-migrations
```
or 
```shell
$ yarn add pg-migrations
```

## [Use](#Use)
```shell
$ pg-migrations path/to/migration.json
```
You will need to setup a migration-history table. I have included an example in the db folder
called `migration_history.sql`. 
```sql
CREATE TABLE IF NOT EXISTS patch_history (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This gives us a patch_history table that is used to store all applied patches. It is recommendws to include this file in your patchPath folder as it is expected. 

The other sql files are expected to have a filename in ISOString() format
`2022-03-18T06:22:06.000Z.sql` and they will be processed in chronological order based upon this filename timestamp representation. 


### [Example `migration.json`](#example)
```json
{
  // Please remove comments as comments are not part of the 
  // official JSON specification.
  "host": "localhost", // 'localhost' is the default;
  "port": 5432, // 5432 is the default;
  "database": "my-db",
  "user": "postgres",
  "password": "example",

  // to auto-exit on idle, without having to shut-down the pool;
  // see https://github.com/vitaly-t/pg-promise#library-de-initialization
  "allowExitOnIdle": true,
  "patchPath": "./db/" // path to SQL patches relative to where this is called from (usually project root)
};
```

The other options contained within are the config that is used by pg-promise to connect to your postgres database. I have this exact object embedded as the defaultConfig if you do not pass one in. 

I plan to add tests shortly for this and would appreciate any feedback or recommendations.
