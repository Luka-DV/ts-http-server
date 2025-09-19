import { Request, Response } from "express";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}


export type ValidResponse = {
    valid: boolean;
};
export type ErrorResponse = {  
    error: string;
};
export type ChirpData = {
    body: string;
};

export async function validateChirp(req: Request, res: Response): Promise<void> {
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
}