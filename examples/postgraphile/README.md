# PostGraphile Example

This example shows how to use `basic-binding` with [PostGraphile](https://github.com/graphile/postgraphile).

## Before you start

Since this example consists of two _Node.js_ server apps and a _PostgreSQL_ server instance, I provided a dockerised distribution via [Lando](https://docs.devwithlando.io/). Lando is therefore required to run this example, at least `v3.0.0-rc1`.

## Run the example

```
$ lando start
```

If all goes smoothly, Lando will eventually print two _green_ URLs on the terminal. If a URL is red, something has gone wrong. In which case, try starting from scratch (`lando destroy -y; lando start`) before getting in touch.

The `media` URL refers to the PostGraphile app. This accepts GraphQL `POST` requests at the root, and exposes [Graph*i*QL](https://github.com/graphql/graphiql) on `/graphiql`.

The `front` URL refers to the Apollo server that connects to the PostGraphile via `basic-binding`. The `/` will redirect to `/graphql`, where GraphQL `POST` requests are accepted, and where [Playground](https://github.com/prisma/graphql-playground) is also exposed.

## Database seeding

The database is automatically seeded on build, via the script in `commands/seed.js`. This, too, uses `basic-binding`, thus seeding the database by invoking a number of GraphQL mutations in the PostGraphile app.

If you want to add more random data, please run

```
$ lando yarn command:seed
```

## What we have done

This simple example does the following:

- The PostGraphile app exposes the PostgreSQL database (see `schema/main.sql`) as a GraphQL API
- The Apollo app connects to the PostGraphile server using `basic-binding`
- The PostGraphile schema is exported to `sdl/pg.graphql` and is imported in `sdl/schema.graphql` (the Apollo server's schema) via [`graphql-import`](https://github.com/prisma/graphql-import)
- All queries and mutations exposed by the PostGraphile service are relayed by the Apollo Server, and their resolution is delegated back to the PostGraphile server using `basic-binding`
- The Apollo server adds a dummy `helloWorld()` query to its schema just to show that it's possible to do more than simply relaying the PostGraphile schema
- The Apollo server also "shields" all Mutations using [`graphql-shield`](https://github.com/maticzav/graphql-shield); a simple rule hardcodes the status of "non authenticated". Thus, the same mutation can be run just fine from the PostGraphile endpoint, but running it from the Apollo endpoint will yield a `Not Authorised!` error.
