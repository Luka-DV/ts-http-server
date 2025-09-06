import express, { Request, Response } from "express";
import { middlewareLogResponses } from "./middleware.js";

const PORT = process.env.PORT || 8080;

const app = express();


app.use("/app", express.static("./src/app")); // root is relative to the project root 

app.use(middlewareLogResponses);

app.get("/healthz", handlerReadiness);

async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})