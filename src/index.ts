
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
    updateUserLoginInfo,
    deleteSingleChirp,
    polkaWebhookUserUpgrade
} from "./api/apiHandlers.js";
import { adminView, 
    getAllUsers, 
    resetRequestsAndDeleteAllUsers 
} from "./api/adminHandlers.js";

import postgres from 'postgres';
import { config } from './config.js';
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";


// automatic migrations at server startup
const migrationClient = postgres(config.db.url, {max: 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig); 

const PORT = config.api.port || 8080;

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

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


