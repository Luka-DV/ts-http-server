import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js" //imports all named exports into a single object named schema
import { config } from "../config.js";

const connection = postgres(config.dbURL); //creates a PostgreSQL client connection 
export const db =  drizzle( connection, { schema }); // wraps that client with Drizzle, registering your table schema. You pass schema so Drizzle knows what tables, columns, relationships you have.
//*ORM: lets you talk to the database using objects, functions etc., instead of writing raw SQL strings.

/* - Schema definitions (tables/columns) generate TS static types.
- When you query via db, the input and the output are checked against those types.
- Mistyped column names, wrong value types, or missing required fields cause compile-time TypeScript errors. */

