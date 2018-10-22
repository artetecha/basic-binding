import { Binding } from "graphql-binding";
import { HttpLink } from "apollo-link-http";
import { makeRemoteExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import { GraphQLSchema } from "graphql";

export interface BasicBindingOptions {
  endpoint?: string;
  typeDefs?: string | GraphQLSchema;
}

export class BasicBinding extends Binding {
  public schema: GraphQLSchema;

  constructor({ endpoint, typeDefs }: BasicBindingOptions) {
    if (!typeDefs) {
      throw new Error(
        "No `typeDefs` provided when calling `new BasicBinding()`"
      );
    }

    if (typeof typeDefs === "string") {
      if (typeDefs.endsWith(".graphql")) {
        let path = require("path");
        let fs = require("fs");
        let schemaPath = path.resolve(typeDefs);
        if (!fs.existsSync(schemaPath)) {
          throw new Error(`No schema found at: ${schemaPath}`);
        }
        typeDefs = importSchema(schemaPath);
      }
    }

    if (endpoint === undefined) {
      throw new Error(
        "No endpoint found. Please provide the `endpoint` constructor option."
      );
    }

    if (!endpoint!.startsWith("http")) {
      throw new Error(`Invalid endpoint provided: ${endpoint}`);
    }

    // Create the `HttpLink` required for the remote executable schema.
    const fetch = require("node-fetch");
    const link = new HttpLink({ uri: endpoint, fetch });

    // Create the remote schema
    const schema = makeRemoteExecutableSchema({ link, schema: typeDefs });

    // Invoke the constructor of `Binding` with the remote schema
    super({
      schema: schema
    });

    this.schema = schema;
  }
}

export { forwardTo } from "graphql-binding";
