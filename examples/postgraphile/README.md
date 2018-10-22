# PostGraphile Example

This example shows how to use `basic-binding` with [PostGraphile](https://github.com/graphile/postgraphile).

## Before you start

_PostGraphile_ needs a PostgreSQL server to connect to. In this repository I provide a dockerised PostgreSQL exposing a database created off a simple schema (see `db/schema.sql`). In order to build and run that container you will need [Lando](https://docs.devwithlando.io/) (at least `v3.0.0-rc1`).

You are free to use another PostgreSQL instance, as long as you remember the following two things:

1. You will have to change the `prestart` script in the `package.json` of this example so that `postgraphile` starts against your own PostgreSQL instance.
2. You won't be able to use the `seed` script in the `package.json`, which assumes you are using the provided PostgreSQL database.

## Run the example

```
$ lando start # if you decided to use the provided PostgreSQL dockerised via Lando
$ yarn install
$ yarn start
```

If all goes smoothly, you will have two servers running:

```bash
PostGraphile v4.0.1 server listening on port 5000 🚀

  ‣ GraphQL API:         http://localhost:5000/media
  ‣ GraphiQL GUI/IDE:    http://localhost:5000/graphiql
  ‣ Postgres connection: postgres://media:[SECRET]@localhost:5555/media
  ‣ Postgres schema(s):  public
  ‣ Documentation:       https://graphile.org/postgraphile/introduction/
  ‣ Please support PostGraphile development: https://graphile.org/donate

* * *

> 🐻 is alive and kicking at:
>> http://localhost:5005/ (Apollo)
```

The latter being the Apollo server sitting in front of the PostGraphile server.

## Seed the database

Leave the app running, and from a different shell instance, run

```
$ yarn seed
```

## What we have done

This simple example does the following:

- PostGraphile server starts in background, exposing the PostgreSQL database as a GraphQL API
- An Apollo server connects to the PostGraphile server using `basic-binding`
- The PostGraphile schema is exported to `schema/pg.graphql` and is imported in `schema/schema.graphql` (the Apollo server's schema) exploiting [`graphql-import`](https://github.com/prisma/graphql-import)
- All queries and mutations exposed by the PostGraphile service are delegated by the Apollo Server back to the PostGraphile server
- The Apollo server adds a dummy `helloWorld()` query to its schema just to show that it's not simply relaying the PostGraphile schema
- The Apollo server also "shields" all Mutations using [`graphql-shield`](https://github.com/maticzav/graphql-shield); a simple rule hardcodes the status of "non authenticated". Thus, the same mutation can be run just fine from the PostGraphile endpoint, but running it from the Apollo endpoint will yield a `Not Authorised!` error.
- The seed script also uses `basic-binding` to connect to the PostGraphile server and populate the database directly via the mutations exposed by the auto-generated GraphQL API.
