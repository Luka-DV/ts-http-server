import express from "express";
import { countFileserverHits, middlewareLogResponses } from "./middleware.js";
import { handlerNumOfRequests, handlerReadiness, resetNumOfRequests } from "./api/apiHandler.js";

const PORT = process.env.PORT || 8080;

const app = express();


app.use(middlewareLogResponses);

app.use("/app", countFileserverHits,express.static("./src/app")); // root is relative to the project root 

app.get("/api/healthz", handlerReadiness);
app.get("/api/metrics", handlerNumOfRequests);
app.get("/api/reset", resetNumOfRequests);


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})