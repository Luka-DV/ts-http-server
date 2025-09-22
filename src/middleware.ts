import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode;

        if(statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`)
        };
    });

    next();
}


export function countFileserverHits(_req: Request, _res: Response, next: NextFunction) {
    config.fileserverHits++;
    //console.log("Req method: ", req.method);
    //console.log("Req url: ", req.url);

    next();
}

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.log(`An error occurred: ${err}`);
    res.status(500)
        .json({
            "error": "Something went wrong on our end",
        });
}