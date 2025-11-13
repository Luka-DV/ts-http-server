import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { deleteALLUsersQuery, getAllUsersQuery } from "../db/queries/users.js";
import { ForbiddenError } from "../errors.js";

export async function adminView(_: Request, res: Response): Promise<void> {
    res.type(".html");
    res.send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
            </body>
        </html>`);
}


export async function resetRequestsAndDeleteAllUsers(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if(config.api.platform !== "dev") {
            throw new ForbiddenError("Forbidden. Reset is only allowed in dev environment.")
        }
        config.api.fileserverHits = 0;
        await deleteALLUsersQuery();
 
        res.type("text/plain; charset=utf-8");
        res.send("Count reset and users deleted");
    } catch (err) {
        next(err)
    }
}


export async function getAllUsers(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if(config.api.platform !== "dev") {
            throw new ForbiddenError("Forbidden. Only allowed in dev environment.")
        }
        const users = await getAllUsersQuery();

        res.status(200)
            .json(users);
    } catch (err) {
        next(err);
    }
}
