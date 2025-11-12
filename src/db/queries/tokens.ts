
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../indexDB.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";


export async function writeRefreshTokenQuery(refToken: NewRefreshToken) {
    const [insert] = await db.insert(refreshTokens)
        .values({...refToken, revokedAt: null})
        .onConflictDoNothing()
        .returning({
            token: refreshTokens.token
        });
    
    return insert;
}


export async function findRefreshTokenQuery(tokenString: string) {
    const token = await db.query.refreshTokens.findFirst({
        where: (refreshTokens, {eq}) => eq(refreshTokens.token, tokenString)
    })

    return token;
}


export async function revokeRefreshTokenQuery(tokenString: string): Promise<{ revokedAt: Date | null } | undefined> {
    const [revokedAt] = await db.update(refreshTokens)
        .set({
            revokedAt: sql`NOW()`,
            updatedAt: sql`NOW()`
        })
        .where(and(eq(refreshTokens.token, tokenString), isNull(refreshTokens.revokedAt)))
        .returning({revokedAt: refreshTokens.revokedAt})

    return revokedAt;
}
