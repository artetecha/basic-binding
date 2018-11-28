const { GrizzlyApollo, GrizzlyExpress } = require("@britishcouncil/grizzly");
const { forwardTo, BasicBinding } = require("basic-binding");
const { rule, shield } = require("graphql-shield");

const postgraphile = new BasicBinding({
  endpoint: "http://media",
  typeDefs: require("path").resolve(`${__dirname}/sdl/pg.graphql`)
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
  schemaFile: `${__dirname}/sdl/schema.graphql`,
  resolvers,
  context: ({ req }) => ({
    postgraphile
  }),
  playground: process.env.NODE_ENV !== "production",
  introspection: process.env.NODE_ENV !== "production",
  endpoint: "/graphql",
  middlewares: [perms]
});

// Create an Express app exposing the GraphQL service.
const app = new GrizzlyExpress({
  graphqlServices: [service]
});

// I originally wanted the service endpoint to be "/".
// However, an odd issue with Apollo Server 2.0 and Lando
// is making Lando URL scanner fail when checking the Apollo
// availability on the active endpoint. The final URL will
// actually work, but it slows down the Lando bootstrap.
// So adopted a trick.
app.app.use("/", (req, res) => {
  res.redirect(301, service.endpoint);
});

// Launch the server.
app.start();
