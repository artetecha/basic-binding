const { GrizzlyApollo, GrizzlyExpress } = require("@britishcouncil/grizzly");
const { forwardTo, BasicBinding } = require("basic-binding");
const { rule, shield } = require("graphql-shield");

const postgraphile = new BasicBinding({
  endpoint: "http://localhost:5000/media",
  typeDefs: require("path").resolve(`${__dirname}/schema/pg.graphql`)
});

const queries = Object.keys(postgraphile.schema.getQueryType().getFields());
const mutations = Object.keys(
  postgraphile.schema.getMutationType().getFields()
);

// Initialise Query with a dummy one to show that you can define
// your own queries, independently of PG.
const Query = {
  helloWorld: () => "Hello World"
};
queries.forEach(element => {
  Query[element] = forwardTo("postgraphile");
});
const Mutation = {};
mutations.forEach(element => {
  Mutation[element] = forwardTo("postgraphile");
});

const resolvers = {
  Query,
  Mutation,
  // Node interface is coming from the PG schema, and without
  // this a warning would be thrown.
  Node: {
    __resolveType(obj, ctx, info) {
      return obj.__typename;
    }
  }
};

// Rules
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return false;
});

const perms = shield({ Mutation: isAuthenticated });

const service = new GrizzlyApollo({
  schemaFile: `${__dirname}/schema/schema.graphql`,
  resolvers,
  context: ({ req }) => ({
    postgraphile
  }),
  playground: process.env.PLATFORM_BRANCH !== "master",
  introspection: process.env.PLATFORM_BRANCH !== "master",
  endpoint: "/",
  middlewares: [perms]
});

// Create an Express app exposing the GraphQL service.
const app = new GrizzlyExpress({
  graphqlServices: [service]
});

// Launch the server.
app.start();
