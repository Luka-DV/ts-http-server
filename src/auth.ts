
import * as argon2 from "argon2";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import test from "node:test";
import { stringify } from "querystring";
import { throwDeprecation } from "process";

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


//JWT

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;

    const tokenPayload: payload = {
        iss: "chirpy",
        sub: userID,
        iat,
        exp
    }

    const token = jwt.sign(tokenPayload, secret)

    //const token = jwt.sign({userID: userID}, secret, {expiresIn: expiresIn});

    return token;
};


export function validateJWT(tokenString: string, secret: string): string {
    /* 
    function isTokenPayload(decoded: string | JwtPayload): decoded is JwtPayload {
        return typeof decoded !== "string" && "sub" in decoded;
    } 
    */
    try {
        const decoded = jwt.verify(tokenString, secret)
        if(typeof decoded === "object"
            && decoded !== null 
            && "sub" in decoded 
            && typeof decoded.sub === "string") 
            {
            return decoded.sub;
        } else {
            throw new UnauthorizedError("No valid token");
        }

     
    } catch (err) {
        if(err instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Token has expired");
        }
        if(err instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError(err.message);
        }
        if(err instanceof jwt.NotBeforeError) {
            throw new UnauthorizedError("JWT not active");
        }
        if(err instanceof UnauthorizedError) {
            throw err;
        }
        throw new UnauthorizedError("Invalid token");
    }
};