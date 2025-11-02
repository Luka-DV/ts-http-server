import { db } from "../indexDB.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";


export async function writeRefreshToken(refToken: NewRefreshToken) {
    const [insert] = await db.insert(refreshTokens)
        .values(refToken)
        .onConflictDoNothing()
        .returning({
            token: refreshTokens.token
        });
    
    return insert;
}

export async function findRefreshToken(tokenString: string) {
    const token = await db.query.refreshTokens.findFirst({
        where: (refreshTokens, {eq}) => eq(refreshTokens.token, tokenString)
    })

    return token;
}