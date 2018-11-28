const program = require("commander");
const { db } = require("../.postgraphilerc");
const { Client } = require("pg");

program
  .version("0.1")
  .description("Handle schema setup and updates.")
  .name("command:schema")
  .option("-U, --enable-uuid", "Enable extension uuid-ossp.")
  .parse(process.argv);

(async () => {
  const client = new Client({
    connectionString: `postgres://${db.username}:${db.password}@${db.host}:${db.port}/${db.path}`,
  });
  client.connect().catch(e => {
    console.log(e);
  });

  if (program.enableUuid) {
    client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`, (err, res) => {
      if (err) throw new Error(err);
      client.end();
      process.exit();
    });
  }
  client.query(
    `SELECT COUNT(tablename) FROM pg_catalog.pg_tables WHERE tableowner = '${db.path}'`,
    (err, res) => {
      if (err) throw new Error(err);
      const fs = require("fs");
      const { exec } = require("child_process");
      const execOptions = {};
      execOptions.env = {
        PGHOST: db.host,
        PGUSER: db.username,
        PGPASSWORD: db.password,
        PGPORT: db.port,
        PGDATABASE: db.path,
      };
      // The DB is empty.
      if (res.rows[0].count == 0) {
        // Import full schema.
        exec("psql < schema/main.sql", execOptions, (err, stdout, stderr) => {
          if (err) throw new Error(err);
          console.log(stdout);
        });
        // Initialise schema config for tracking updates.
        fs.writeFileSync("run/schema-config.json", JSON.stringify({ update: "" }));
      } else {
        // The DB is not empty.
        const glob = require("glob");
        // Get the list of update files.
        glob("schema/update.*.sql", (err, matches) => {
          if (err) throw new Error(err);
          const latestUpdate =
            (fs.existsSync("run/schema-config.json") &&
              JSON.parse(fs.readFileSync("run/schema-config.json")).update) ||
            "";
          matches.forEach(newUpdate => {
            if (newUpdate > latestUpdate) {
              exec(`psql < ${newUpdate}`, execOptions, (err, stdout, stderr) => {
                if (err) throw new Error(err);
                console.log(stdout);
                console.log(stderr);
              });
              fs.writeFileSync("run/schema-config.json", JSON.stringify({ update: newUpdate }));
            }
          });
        });
      }
      client.end();
    },
  );
})();
