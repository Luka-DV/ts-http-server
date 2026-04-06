import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

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

    next();
}


export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error("Error handler: ", err);
    let statusCode = 500;

    switch(true) {
        case err instanceof ConflictError:
            statusCode = 409;
            break
        case err instanceof NotFoundError:
            statusCode = 404;
            break
        case err instanceof ForbiddenError:
            statusCode = 403;
            break
        case err instanceof UnauthorizedError:
            statusCode = 401;
            break
        case err instanceof BadRequestError:
            statusCode = 400;
            break
    } 

    const errorMsg = statusCode === 500 ? "Internal server error" : err.message;

    res.status(statusCode).json({"error": errorMsg});  
}