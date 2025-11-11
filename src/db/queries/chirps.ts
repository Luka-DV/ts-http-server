import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../indexDB.js";
import { chirps, NewChirp } from "../schema.js";


export async function createChirpQuery(chirp: NewChirp) {
       const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();

        console.log("New CHIRP: ", result);
    return result;
}


export async function getAllChirpsQuery() {
    const allChirps = await db.query.chirps.findMany({
        //oderBy: (chirps, { asc }) => [asc(chirps.createdAt)],
        //orderBy: [desc(chirps.createdAt)]
    });

    return allChirps;
}

export async function getAllChirpsFromSingleUserQuery(userID: string) {
    const allChirpsFromUser = await db.query.chirps.findMany({
        where: (chirps, { eq }) => eq(chirps.userId, userID), 
        //orderBy: (chirps, { asc }) => [asc(chirps.createdAt)],
    })

    return allChirpsFromUser;
}



export async function getSingleChirpQuery(chirpID: string) {
    const chirp = await db.query.chirps.findFirst({
        where: (chirps, {eq}) => eq(chirps.id, chirpID),
    })

    return chirp;
}

export async function deleteChirpQuery(chirpID: string) {
    const [deleted] = await db.delete(chirps)
        .where(eq(chirps.id, chirpID))
        .returning({deleted: chirps.id})
    
    return deleted;
}
