if (process.env.NODE_ENV == "production") {
  console.log("Nothing to do in production.");
  process.exit(0);
}

const program = require("commander");
const { BasicBinding } = require("basic-binding");
const faker = require("faker");
const { HttpLink } = require("apollo-link-http");
const fetch = require("node-fetch");
const { introspectSchema } = require("graphql-tools");

program
  .version("0.1")
  .description("Seed the database with random data.")
  .name("command:seed")
  .option("-a, --authors <num>", "Number of authors to create. Default: 10", 10)
  .option(
    "-m, --metas <num>",
    "Number of meta items to create. Default: 10",
    10
  )
  .option(
    "-M, --media <num>",
    "Number of media items to create. Default: 10",
    10
  )
  .option(
    "-e, --endpoint <url>",
    `GraphQL endpoint. Default: http://localhost:${process.env.PORT}`,
    `http://localhost:${process.env.PORT}`
  )
  .parse(process.argv);

(async () => {
  // Fetch remote.
  const link = new HttpLink({ uri: program.endpoint, fetch });

  // Get GraphQLSchema.
  const typeDefs = await introspectSchema(link);

  // Bind to the remote GraphQL service.
  const postgraphile = new BasicBinding({
    endpoint: program.endpoint,
    typeDefs
  });

  // Array of promises.
  const promises = [];

  // Run the `createAuthor` mutations and collect the returned promises.
  for (var i = 0; i < program.authors; i++) {
    promises.push(
      postgraphile.mutation.createAuthor(
        {
          input: {
            author: {
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName()
            }
          }
        },
        "{ author {id} }"
      )
    );
  }
  // Complete all asynchronous mutations and get the results.
  const authors = await Promise.all(promises).catch(e => {
    console.log(e);
    process.exit(1);
  });
  // Sort authors by id in ascedent order.
  authors.sort((a, b) => {
    return a.author.id - b.author.id;
  });
  // Print authors out.
  console.log(authors);

  // Reset the array of promises.
  promises.splice(0, promises.length);

  const metas = [];
  // Run the `createMeta` mutations and collect the returned promises.
  for (var i = 0; i < program.metas; i++) {
    metas[i] = {};
    for (var j = 0; j < 10; j++) {
      metas[i][faker.random.word().toLowerCase()] = faker.lorem.sentence(5);
    }
  }

  let mediaType;
  let inputObj;
  // Run the `createMedia` mutations and collect the returned promises.
  for (var i = 0; i < program.media; i++) {
    mediaType = `${faker.random.arrayElement([
      "audio",
      "document",
      "image",
      "video"
    ])}`;
    inputObj = { input: {} };
    inputObj["input"][mediaType] = {
      published: faker.random.boolean(),
      title: faker.lorem.sentence(7),
      description: faker.lorem.paragraph(4),
      uuid: faker.random.uuid(),
      tags: [faker.random.word(), faker.random.word(), faker.random.word()],
      authorId:
        authors[faker.random.number({ min: 0, max: program.authors - 1 })]
          .author.id,
      meta: JSON.stringify(
        metas[faker.random.number({ min: 0, max: program.metas - 1 })]
      )
    };
    promises.push(
      postgraphile.mutation[
        `create${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`
      ](inputObj, `{ ${mediaType} { id, authorId, meta }}`)
    );
  }
  // Complete all asynchronous mutations and get the results.
  const media = await Promise.all(promises).catch(e => {
    console.log(e);
    process.exit(1);
  });
  // Print media out.
  console.log(media);
})();
