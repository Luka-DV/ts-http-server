import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors.js"
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}


export type ValidResponse = {
    valid?: boolean;
    cleanedBody?: string;
};
export type ErrorResponse = {  
    error: string;
};
export type ChirpData = {
    body: string;
};


export async function validateChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const chirp = req.body;

        if (!chirp || !("body" in chirp) || typeof chirp.body !== "string") {
            throw new BadRequestError("Invalid request");
        }

        if(chirp.body.length > 140) {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }

        const cleanChirpText = cleanChirp(chirp.body);

        const validChirp: ValidResponse = {
            cleanedBody: cleanChirpText
        };
    
        res.type("application/json")
        res.status(200)
            .send(JSON.stringify(validChirp));

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
        const newUserEmail: NewUser = req.body;
        if(!newUserEmail.email || typeof newUserEmail.email !== "string") {
            throw new BadRequestError("Missing email!");
        }
        const createdUser = await createUser(newUserEmail);

        res.type("json");
        res.status(201).json(createdUser);
        
    } catch (err) {
        next(err);
    }
}