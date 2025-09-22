import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors.js"


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

        // console.log("REQ: ",req);
        // console.log("CHIRP: ", chirp);  
        // console.log("CHIRP body: ", chirp.body);

        const cleanChirpText = cleanChirp(chirp.body);

        const validChirp: ValidResponse = {
            //"valid": true,
            cleanedBody: cleanChirpText
        };
    
        
        res.type("application/json")
        res.status(200)
            .send(JSON.stringify(validChirp));

    } catch(err) {
        next(err);

/*         if(err instanceof Error) {
            const errorMsg: ErrorResponse = {
            "error": `${err.message}`
            }

            res.type("application/json");
            res.status(400)
                .send(JSON.stringify(errorMsg));
        } */
    }


// manualy parsing the request body:
/*  
   let body = "";

    // Listen for data events
    req.on("data", (chunk) => {
        body += chunk;
    });

    // Listen for end events
    req.on("end", () => {

        try {
            let parsedBody: ChirpData;

            try {
                parsedBody = JSON.parse(body);
            } catch(err) {
                throw new Error("Invalid JSON", {cause: err});
            }
            

            if(typeof parsedBody.body !== "string") {
                throw new Error("Invalid body");
            }

            if(parsedBody.body.length > 140) {
                throw new Error("Chirp is too long");
            }

            const isValidChirp: ValidResponse = {
                "valid": true
            };
            
            res.type("application/json")
            res.status(200)
                .send(JSON.stringify(isValidChirp));

        } catch (error) {
            if(error instanceof Error) {
                const errorMsg: ErrorResponse = {
                "error": `${error.message}`,
                }

                if(error.cause) {
                    const causeMsg = error.cause instanceof Error ? error.cause.message : String(error.cause);
                    console.log(causeMsg);
                }

                res.type("application/json");
                res.status(400)
                    .send(JSON.stringify(errorMsg));
            }
        }
    }); 
    */

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