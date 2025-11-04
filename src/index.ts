
import express from "express";
import { 
    countFileserverHits, 
    errorHandler, 
    middlewareLogResponses 
} from "./middleware.js";
import { createNewUser, 
    getAllChirps, 
    getSingleChirp, 
    handlerReadiness, 
    userLogin, 
    handlerCreateChirp,
    refreshAccessToken,
    revokeRefreshToken,
    updateUserLoginInfo
} from "./api/apiHandlers.js";
import { adminView, 
    checkAllUsers, 
    resetNumOfRequestsAndDeleteALLUsers 
} from "./api/adminHandlers.js";

import postgres from 'postgres';
import { config } from './config.js';
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationClient = postgres(config.db.url, {max: 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig); //runs automatic migrations at server startup

const PORT = config.api.port || 8080;

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", countFileserverHits,express.static("./src/app")); // root is relative to the project root 

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", adminView);
app.post("/admin/reset", resetNumOfRequestsAndDeleteALLUsers);

app.post("/api/users", createNewUser);
app.get("/admin/users", checkAllUsers); //testing
app.put("/api/users", updateUserLoginInfo);

app.post("/api/login", userLogin);
app.post("/api/refresh", refreshAccessToken);
app.post("/api/revoke", revokeRefreshToken);

app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", getAllChirps);
app.get("/api/chirps/:chirpID", getSingleChirp);


app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})


