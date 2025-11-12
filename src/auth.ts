
import * as argon2 from "argon2";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { config } from "./config.js";
import { randomBytes } from "node:crypto";
import { writeRefreshTokenQuery } from "./db/queries/tokens.js";


//Password hashing with argon2:
export async function hashPassword(password: string): Promise<string> {
        const hash = await argon2.hash(password);
        if(!hash) {
            throw new BadRequestError("Hashing was not successful")
        }

        return hash;
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try{
        const passwordMatchBool = await argon2.verify(hash, password);
        return passwordMatchBool;
    } catch(err) {
        // console.error(err); // production alternative: Pino testing library
        return false;
    }
}


// JWT

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;

    const tokenPayload: payload = {
        iss: config.jwt.issuer,
        sub: userID,
        iat,
        exp
    };

    const token = jwt.sign(tokenPayload, secret);

    return token;
};


export function validateJWT(tokenString: string, secret: string): string {
    try {
        const decoded = jwt.verify(tokenString, secret)
        if(typeof decoded === "object"
            && decoded !== null 
            && "sub" in decoded 
            && typeof decoded.sub === "string") 
        {
            return decoded.sub;
        } else {
            throw new UnauthorizedError("Invalid token payload");
        }

    } catch (err) {
        if(err instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Token has expired");
        }
        if(err instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError(err.message);
        }
        if(err instanceof jwt.NotBeforeError) {
            throw new UnauthorizedError("Token not active");
        }
        if(err instanceof UnauthorizedError) {
            throw err;
        }
        throw err;
    }
};


export function getBearerToken(req: Request): string {

    const tokenString = req.get("Authorization");
    if(typeof tokenString !== "string") {
        throw new UnauthorizedError("Missing authorization header")
    };

    const [bearer, cleanToken] = tokenString.split(" ");
    if (bearer !== "Bearer" || !cleanToken) {
        throw new UnauthorizedError("Wrong token format or missing token");
    }
    return cleanToken;
};


export async function makeRefreshToken(userId: string): Promise<string>{
    const encodedString = await new Promise<string>((resolve, reject) => {
        randomBytes(32, (err, buf) => {
            if (err) {
                return reject(err)
            }
            resolve(buf.toString("hex"));
        });
    })

    const tokenRow = await writeRefreshTokenQuery({
        token: encodedString,
        userId
    })

    if(tokenRow) { // either { token: string } or undefined if failed
        return tokenRow.token;
    }

    return makeRefreshToken(userId);
    // could improve: limited number of retries to avoid infinite recursion
}


export function getAPIKey(req: Request): string {
    const keyString = req.get("Authorization");
     if(typeof keyString !== "string") {
        throw new UnauthorizedError("Missing authorization header");
    };

    const [keyword, apiKey] = keyString.split(" ");
      if (keyword !== "ApiKey" || !apiKey) {
        throw new UnauthorizedError("Wrong header format or missing key");
    }

    return apiKey;
}