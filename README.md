# PG-Migrations

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

