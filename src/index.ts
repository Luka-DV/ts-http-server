import express, { Request, Response } from "express";
import { countFileserverHits, middlewareLogResponses } from "./middleware.js";
import { config } from "./config.js";

const PORT = process.env.PORT || 8080;

const app = express();


app.use(middlewareLogResponses);

app.use("/app", countFileserverHits,express.static("./src/app")); // root is relative to the project root 


app.get("/healthz", handlerReadiness);
async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

app.get("/metrics", handlerNumOfRequests);
async function handlerNumOfRequests(_: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
}

app.get("/reset", resetNumOfRequests);
async function resetNumOfRequests(_: Request, res: Response): Promise<void> {
    config.fileserverHits = 0;
    //res.set("Content-Type", "text/plain; charset=utf-8");
    res.type("text/plain");
    res.send("Count reset");
}


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})