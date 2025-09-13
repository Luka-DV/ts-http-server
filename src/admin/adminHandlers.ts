import { Request, Response } from "express";
import { config } from "../config.js";

export async function adminView(_: Request, res: Response): Promise<void> {
    res.type(".html");
    res.send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileserverHits} times!</p>
            </body>
        </html>`);
}

export async function resetNumOfRequests(_: Request, res: Response): Promise<void> {
    config.fileserverHits = 0;
    //res.set("Content-Type", "text/plain; charset=utf-8");
    res.type("text/plain");
    res.send("Count reset");
}