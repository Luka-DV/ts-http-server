import { db } from "../indexDB.js";
import { NewUser, users } from "../schema.js";


export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteALLUsers() {
    await db.delete(users);
}

export async function getAllUsers() {
    const allUsers = await db.query.users.findMany();

    return allUsers;
}