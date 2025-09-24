
import { loadEnvFile } from 'node:process';
loadEnvFile();

export type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};


function envOrThrow(key: string) {
    if(!process.env[key]) {
        throw new Error("Missing connection string!");
    }
    return process.env[key];
}


export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL")
}
