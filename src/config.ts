
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { loadEnvFile } from 'node:process';
loadEnvFile();

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
    polkaKey: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

type JWTConfig = {
    secret: string;
    issuer: string;
    defaultDuration: number;
}

type Config = {
    api: APIConfig,
    db: DBConfig,
    jwt: JWTConfig,
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
        polkaKey: envOrThrowErr("POLKA_KEY")
    },
    db: {
        url: envOrThrowErr("DB_URL"),
        migrationConfig: {
            migrationsFolder: "./src/db/migrations",
        }
    },
    jwt: {
        secret: envOrThrowErr("SECRET"),
        issuer: "chirpy",
        defaultDuration: 60*60 // 1h in seconds
    }
}
