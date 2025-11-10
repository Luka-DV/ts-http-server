import { NextFunction, Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors.js"
import { createUserQuery, getSingleUserQuery, updateUserInfoQuery, upgradeUserToRedQuery, UserResponse } from "../db/queries/users.js";
import { createChirpQuery, deleteChirpQuery, getAllChirpsQuery, getSingleChirpQuery } from "../db/queries/chirps.js";
import { NewChirp, NewUser } from "../db/schema.js";
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { findRefreshTokenQuery, revokeRefreshTokenQuery } from "../db/queries/tokens.js";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

/* export type ValidResponse = {
    //valid?: boolean;
    body: string;
    userId: string
}; */
export type ErrorResponse = {  
    error: string;
};
export type ChirpData = {
    body: string;
};


export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userToken = getBearerToken(req);

        const userIdFromToken = validateJWT(userToken, config.jwt.secret);

        const chirp: {body: string} = req.body;

        const chirpText = validateChirp(chirp)

        const cleanChirpText = cleanChirp(chirpText);

        const validChirp: NewChirp = {
            body: cleanChirpText,
            userId: userIdFromToken
        };

        const newChirp = await createChirpQuery(validChirp);
    
        res.status(201)
            .json(newChirp);

    } catch(err) {
        next(err);
    }
}


function validateChirp(chirp: {body: string}): string {
    if (!chirp
        || !("body" in chirp) 
        || typeof chirp.body !== "string") {
        throw new BadRequestError("Invalid request");
    }

    if(chirp.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    return chirp.body;
} 


function cleanChirp(text: string): string {
    const profaneWords = [
        "kerfuffle",
        "sharbert",
        "fornax"
    ]

    const textArray = text.trim().split(" ");

    const textArrayLowerCase = 
        text.toLowerCase()
            .trim()
            .split(" ");

    for(let i = 0; i < textArrayLowerCase.length; i++) {
        if(profaneWords.includes(textArrayLowerCase[i])) {
            textArray[i] = "****";
        }
    }

    return textArray.join(" ");
}


export async function createNewUser(req: Request, res: Response, next: NextFunction): Promise<void>  {
    try {
        const newUserParams: {email:string, password: string} = req.body;

        if(!newUserParams.email || typeof newUserParams.email !== "string") {
            throw new BadRequestError("Missing or faulty email");
        }
        if(!newUserParams.password || typeof newUserParams.password !== "string") {
            throw new BadRequestError("Missing or invalid user password");
        }

        const hashedPassword = await hashPassword(newUserParams.password);

        const createdUser = await createUserQuery({
            email: newUserParams.email,
            hashedPassword
        }) satisfies NewUser;

        res.status(201).json(createdUser);
        
    } catch (err) {
        next(err);
    }
}

export async function userLogin(req: Request, res: Response, next: NextFunction): Promise<void>  {
    try {
        const userParams: {password: string, email: string} = req.body;

        if(!userParams.email || typeof userParams.email !== "string") {
            throw new BadRequestError("Missing or faulty email");
        }
        if(!userParams.password || typeof userParams.password !== "string") {
            throw new BadRequestError("Missing or invalid user password");
        }

        const user = await getSingleUserQuery(userParams.email);

        if(!user || !user.email) {
            throw new UnauthorizedError("Incorrect email or password");
        }

        const matchingPasswords = await checkPasswordHash(
            userParams.password, 
            user.hashedPassword
        );

        if(!matchingPasswords) {
            throw new UnauthorizedError("Incorrect email or password");
        }

        const {hashedPassword, ...safeUser } = user;

        const jwt = makeJWT(
            user.id, 
            config.jwt.defaultDuration,
            config.jwt.secret
        )

        const refreshToken = await makeRefreshToken(user.id);

        const safeUserWithTokens = {...safeUser, token: jwt, refreshToken};

        console.log("SAFE_USER_LOGIN: ", safeUserWithTokens) // TEST

        res.status(200)
            .json(safeUserWithTokens); //
        
    } catch (err) {
        next(err);
    }
}


export async function updateUserLoginInfo(req: Request, res: Response, next: NextFunction) {
    try {
        const userToken = getBearerToken(req);
        const userId = validateJWT(userToken, config.jwt.secret);

        const userParams: {password: string, email: string} = req.body;
        if(!userParams.email || typeof userParams.email !== "string") {
            throw new BadRequestError("Missing or faulty email");
        }
        if(!userParams.password || typeof userParams.password !== "string") {
            throw new BadRequestError("Missing or invalid user password");
        }

        const hashedPassword = await hashPassword(userParams.password);

        const updatedUser = await updateUserInfoQuery(userId, userParams.email, hashedPassword);

        res.status(200)
            .json(updatedUser);

    } catch (err) {
        next(err)
    } 
}


export async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenString = getBearerToken(req);
        const refreshToken = await findRefreshTokenQuery(tokenString);
        if(!refreshToken || 
            refreshToken.expiresAt.getTime() <= Date.now() ||
            refreshToken.revokedAt !== null
        ){
            throw new UnauthorizedError("Refresh token missing, expired or revoked");
        }

         const jwt = makeJWT(
            refreshToken.userId, 
            config.jwt.defaultDuration,
            config.jwt.secret
        )

        res.status(200)
            .json({token: jwt});

    } catch (err) {
        next(err);
    }
}


export async function revokeRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const tokenString = getBearerToken(req);
        const revokedAt = await revokeRefreshTokenQuery(tokenString);
        if(revokedAt === undefined) {
            throw new UnauthorizedError("Token missing or already revoked")
        }
        console.log("REFRESH token REVOKED");

        res.status(204)
            .end();

    } catch (err) {
        next(err);
    }
}


export async function getAllChirps(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allChirps = await getAllChirpsQuery();

        res.status(200)
            .json(allChirps);

    } catch (err) {
        next(err)
    }
}


export async function getSingleChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { chirpID } = req.params;
        const singleChirp = await getSingleChirpQuery(chirpID);

        if(!singleChirp) {
            throw new NotFoundError("No chirp with this ID was found");
        }

        res.status(200)
            .json(singleChirp);

    } catch (err) {
        next(err)
    }
}


export async function deleteSingleChirp(req:Request, res: Response, next: NextFunction) {
    try {
        const { chirpID } = req.params;

        const userToken = getBearerToken(req);
        const userId = validateJWT(userToken, config.jwt.secret);

        const chirp = await getSingleChirpQuery(chirpID);

        if(chirp === undefined) {
            throw new NotFoundError("Chirp not found");
        }

        if(chirp.userId !== userId) {
            throw new ForbiddenError("User is not the owner of this chirp");
        }

        const deletedChirpID = await deleteChirpQuery(chirp.id);
        if(!deletedChirpID.deleted) {
            throw new Error("Deletion not successful")
        }

        res.status(204)
            .end();

    } catch (err) {
        next(err);
    }
}


export async function polkaWebhookUserUpgrade(req: Request, res: Response, next: NextFunction) {
    try {
        type polkaWebhook = {
            event: string,
            data: {
                userId: string
            }
        }

        const apiKey = getAPIKey(req);

        if(apiKey !== config.api.polkaKey) {
            throw new UnauthorizedError("Wrong API key");
        }

        const weebhook: polkaWebhook  = req.body;
        if(weebhook.event !== "user.upgraded") {
            res.status(204)
            .end();
            return;
        }
        const upgradedUser = await upgradeUserToRedQuery(weebhook.data.userId)

        if(upgradedUser === undefined) {
            throw new NotFoundError("User not found");
        }

        console.log("UPGRADED USER: ",  upgradedUser);

        res.status(204)
            .end();


    } catch (err) {
        next(err);
    }
}