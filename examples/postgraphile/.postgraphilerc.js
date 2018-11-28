const db = JSON.parse(
  Buffer.from(process.env.PLATFORM_RELATIONSHIPS, "base64").toString()
).pg[0];

module.exports = {
  options: {
    connection: `postgres://${db.username}:${db.password}@${db.host}:${
      db.port
    }/${db.path}`,
    // Recommended to be off in production.
    disableQueryLog: process.env.NODE_ENV === "production",
    // Recommended to be off in production.
    disableGraphiql: process.env.NODE_ENV === "production",
    // Enable `watch` only in development.
    watch: process.env.NODE_ENV === "development",
    port: process.env.PORT,
    host: "0.0.0.0",
    simpleCollections: "both",
    graphql: "/",
    legacyRelations: "omit",
    appendPlugins: [
      "postgraphile-plugin-connection-filter",
      "postgraphile-plugin-nested-mutations",
      "postgraphile-artetecha-inflector"
    ],
    exportSchemaGraphql: "sdl/pg.graphql"
  },
  // The above 'options' is the only key PostGraphile will require.
  // Others are ignored, but still safe to be added. So exporting 'db'
  // here to avoid code duplication.
  db
};
