import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors.js"
import { createUser } from "../db/queries/users.js";
import { createChirp } from "../db/queries/chirps.js";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}


export type ValidResponse = {
    //valid?: boolean;
    body: string;
    userId: string
};
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

        const validChirp: ValidResponse = {
            body: cleanChirpText,
            userId: chirp.userId
        };

        const newChirp = await createChirp(validChirp);
    
        // res.type("application/json")
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
        type NewUserEmail = {
            email: string;
        }
        const newUserEmail: NewUserEmail = req.body;

        if(!newUserEmail.email || typeof newUserEmail.email !== "string") {
            throw new BadRequestError("Missing or faulty email!");
        }
        const createdUser = await createUser(newUserEmail);

        res.status(201).json(createdUser);
        
    } catch (err) {
        next(err);
    }
}