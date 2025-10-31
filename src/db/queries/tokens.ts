import { db } from "../indexDB";
import { refreshTokens } from "../schema";


export async function writeRefreshToken(refToken: string) {

    await db.insert(refreshTokens)
        .values(refToken)
        .onConflictDoNothing()
    
}