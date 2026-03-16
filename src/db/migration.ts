import postgres from 'postgres';
import { config } from '../config.js';
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export async function runDBMigrations() {
    const migrationClient = postgres(config.db.url, {max: 1});
    try {
        await migrate(drizzle(migrationClient), config.db.migrationConfig); 
    }
    finally {
        await migrationClient.end();    
    }
}
