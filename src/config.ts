
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { loadEnvFile } from 'node:process';
loadEnvFile();

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

type Config = {
    api: APIConfig,
    db: DBConfig
}

function envOrThrowErr(key: string) {
    if(!process.env[key]) {
        throw new Error("Missing .env value!");
    }
    return process.env[key];
}


export const config: Config = {
    api: {
        fileserverHits: 0,
        port: Number(envOrThrowErr("PORT")),
        platform: envOrThrowErr("PLATFORM"),
    },
    db: {
        url: envOrThrowErr("DB_URL"),
        migrationConfig: {
            migrationsFolder: "./src/db/migrations",
        }
    }
}
