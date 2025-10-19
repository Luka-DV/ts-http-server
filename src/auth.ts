
import * as argon2 from "argon2";
import { BadRequestError } from "./errors.js";

//Hash the password using the argon2.hash function:

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password);
        if(!hash) {
            throw new BadRequestError("Hashing was not successful")
        }
        return hash;
    } catch (err) {
        throw err;
    }
}

//Use the argon2.verify function to compare the password in the HTTP request with the password that is stored in the database:

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try{
        const passwordMatchBool = await argon2.verify(hash, password);
        return passwordMatchBool;
    } catch(err) {
        throw err;
    }
}