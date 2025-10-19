import { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors.js"
import { createUser, getSingleUserQuery, UserResponse } from "../db/queries/users.js";
import { createChirp, getAllChirpsQuery, getSingleChirpQuery } from "../db/queries/chirps.js";
import { NewChirp, NewUser } from "../db/schema.js";
import { checkPasswordHash, hashPassword } from "../auth.js";

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



export async function validateAndCreateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const chirp = req.body;

        if (!chirp
            || !("body" in chirp) 
            || typeof chirp.body !== "string" 
            || !("userId" in chirp)
            || typeof chirp.userId !== "string") {
            throw new BadRequestError("Invalid request");
        }

        if(chirp.body.length > 140) {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }

        const cleanChirpText = cleanChirp(chirp.body);

        const validChirp: NewChirp = {
            body: cleanChirpText,
            userId: chirp.userId
        };

        const newChirp = await createChirp(validChirp);
    
        res.status(201)
            .json(newChirp);

    } catch(err) {
        next(err);
    }
}


function cleanChirp(text: string) {
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

        const createdUser = await createUser({
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

        res.status(200)
            .json(safeUser);
        
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