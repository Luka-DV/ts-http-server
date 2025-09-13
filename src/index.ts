import express from "express";
import { countFileserverHits, middlewareLogResponses } from "./middleware.js";
import { handlerReadiness} from "./api/apiHandler.js";
import { adminView, resetNumOfRequests } from "./admin/adminHandlers.js";

const PORT = process.env.PORT || 8080;

const app = express();


app.use(middlewareLogResponses);

app.use("/app", countFileserverHits,express.static("./src/app")); // root is relative to the project root 

app.get("/api/healthz", handlerReadiness);
//app.get("/api/metrics", handlerNumOfRequests);
app.get("/admin/reset", resetNumOfRequests);

app.get("/admin/metrics", adminView);


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})