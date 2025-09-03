import express, { Request, Response } from "express";

const PORT = process.env.PORT || 8080;

const app = express();


app.use("/app", express.static("./src/app"));


app.get("/healthz", handlerReadiness);

async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})