import { Request, Response } from "express";
import { config } from "../config.js";


export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerNumOfRequests(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
}

export async function resetNumOfRequests(_: Request, res: Response): Promise<void> {
    config.fileserverHits = 0;
    //res.set("Content-Type", "text/plain; charset=utf-8");
    res.type("text/plain");
    res.send("Count reset");
}