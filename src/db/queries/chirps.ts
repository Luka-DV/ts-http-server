import { db } from "../indexDB.js";
import { chirps, NewChirp } from "../schema.js";


export async function createChirp(chirp: NewChirp) {
       const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();

        console.log("RESULT: ,", result);
    return result;
}


export async function getAllChirpsQuery() {
    const allChirps = await db.query.chirps.findMany({
        orderBy: (chirps, { asc }) => [asc(chirps.createdAt)],
    })

    return allChirps;
}
