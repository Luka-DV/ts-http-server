import { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

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
    config.api.fileserverHits++;
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
    switch(true) {
        case true: 
            console.error(err);
        case err instanceof NotFoundError:
            res.status(404).json({"error": err.message});
            break;
        case err instanceof ForbiddenError:
            res.status(403).json({"error": err.message});
            break;
        case err instanceof UnauthorizedError:
            res.status(401).json({"error": err.message});
            break;
        case err instanceof BadRequestError:
            res.status(400).json({"error": err.message});
            break;
        default:
            console.error(err);  
            res.status(500).send("Internal Server Error");  

    }
}