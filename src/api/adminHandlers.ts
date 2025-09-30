import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { deleteALLUsers, getAllUsers } from "../db/queries/users.js";
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

export async function resetNumOfRequestsAndDeleteALLUsers(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if(config.api.platform !== "dev") {
            throw new ForbiddenError("Forbidden. Wrong platform.")
        }
        config.api.fileserverHits = 0;
        await deleteALLUsers();
        //res.set("Content-Type", "text/plain; charset=utf-8");
        res.type("text/plain");
        res.send("Count reset and users deleted");

    } catch (err) {
        next(err)
    }
}

export async function checkAllUsers(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const users = await getAllUsers();
        res.type("json");
        res.status(201).json(users);
    } catch (err) {
        next(err);
    }
}

