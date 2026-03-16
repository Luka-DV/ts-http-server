import express from "express";
//import cookieParser from 'cookie-parser';
import { 
    countFileserverHits, 
    errorHandler, 
    middlewareLogResponses 
} from "./middleware.js";

import { 
    createNewUser, 
    getAllChirps, 
    getSingleChirp, 
    handlerReadiness, 
    userLogin, 
    handlerCreateChirp,
    refreshAccessToken,
    revokeRefreshToken,
    updateUserLoginInfo,
    deleteSingleChirp,
    polkaWebhookUserUpgrade
} from "./api/apiHandlers.js";

import { 
    adminView, 
    getAllUsers, 
    resetRequestsAndDeleteAllUsers 
} from "./api/adminHandlers.js";

import { config } from './config.js';
import { runDBMigrations } from "./db/migration.js";

// automatic migrations at server startup
try {
    await runDBMigrations();
} catch (err) {
    console.error("Database migration failed. Server will not start.");
    throw err;
}

const PORT = config.api.port || 8080;

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());
//app.use(cookieParser()); 

// root is relative to the project root 
app.use("/app", countFileserverHits,express.static("./src/app")); 

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", adminView);
app.get("/admin/users", getAllUsers);
app.post("/admin/reset", resetRequestsAndDeleteAllUsers);

app.post("/api/users", createNewUser);
app.put("/api/users", updateUserLoginInfo);
app.post("/api/polka/webhooks", polkaWebhookUserUpgrade);

app.post("/api/login", userLogin);
app.post("/api/refresh", refreshAccessToken);
app.post("/api/revoke", revokeRefreshToken);

app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", getAllChirps);
app.get("/api/chirps/:chirpID", getSingleChirp);
app.delete("/api/chirps/:chirpID", deleteSingleChirp);


app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Bravo! Server is listening on PORT: ${PORT}.`);
})


