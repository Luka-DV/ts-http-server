import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { config } from "../config.js";

// PostgreSQL client connection to a PSQL server
const connection = postgres(config.db.url);  
export const db =  drizzle( connection, { schema }); 
// wraps that client with Drizzle, registering your table schema

/* 
- Schema definitions (tables/columns) generate TS static types.
- When you query via db, the input and the output are checked against those types.
- Mistyped column names, wrong value types, or missing required fields cause compile-time TypeScript errors. 
*/
