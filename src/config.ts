
import { loadEnvFile } from 'node:process';
loadEnvFile();


const dbURL = envOrThrow("DB_URL")

function envOrThrow(key: string) {
    if(!process.env[key]) {
        throw new Error("Missing connection string!");
    }
    return process.env[key];
}


export type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};

export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: dbURL
}



