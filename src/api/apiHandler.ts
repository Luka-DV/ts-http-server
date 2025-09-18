import { Request, Response } from "express";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function validateChirp(req: Request, res: Response): Promise<void> {
    let body: string = "";

    // Listen for data events
    req.on("data", (chunk) => {
        body += chunk;
    });

    // Listen for end events
    req.on("end", () => {

        type validResponse = {
            valid: boolean;
        }
        type errorRespnse = {
            error: string;
        }

        try {
            const parsedBody = JSON.parse(body);

            if(parsedBody.body.length > 140) {
                throw "Chirp is too long";
            }

            const isValidChirp: validResponse = {
                "valid": true
            };
            
            res.type("application/json")
            res.status(200)
                .send(JSON.stringify(isValidChirp));

        } catch (error) {

            const errorMsg: errorRespnse = {
                "error": `${error}`
            }

            res.type("application/json");
            res.status(400)
                .send(JSON.stringify(errorMsg));
        }
    });
}