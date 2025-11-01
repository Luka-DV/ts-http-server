import { db } from "../indexDB";
import { NewRefreshToken, refreshTokens } from "../schema";


export async function writeRefreshToken(refToken: NewRefreshToken) {
    const [insert] = await db.insert(refreshTokens)
        .values(refToken)
        .onConflictDoNothing()
        .returning({
            token: refreshTokens.token
        });
    
    return insert;
}