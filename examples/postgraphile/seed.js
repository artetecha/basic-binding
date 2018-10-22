const { BasicBinding } = require("basic-binding");
const faker = require("faker");

const postgraphile = new BasicBinding({
  endpoint: "http://localhost:5000/media",
  typeDefs: require("path").resolve(`${__dirname}/schema/pg.graphql`)
});

const promises = [];

for (var i = 1; i <= 100; i++) {
  promises.push(
    postgraphile.mutation.createAuthor({
      input: {
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        }
      }
    })
  );
}

Promise.all(promises).then(() => {
  for (var i = 1; i <= 1000; i++) {
    postgraphile.mutation.createMedia({
      input: {
        media: {
          title: faker.lorem.sentence(7),
          description: faker.lorem.paragraph(4),
          caption: faker.lorem.sentence(4),
          ratio: faker.random.arrayElement(["LANDSCAPE", "PORTRAIT", "SQUARE"]),
          type: faker.random.arrayElement([
            "AUDIO",
            "DOCUMENT",
            "IMAGE",
            "VIDEO"
          ]),
          uri: faker.internet.url(),
          authorId: faker.random.number({ min: 1, max: 100 })
        }
      }
    });
  }
});
