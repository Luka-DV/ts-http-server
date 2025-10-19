import { db } from "../indexDB.js";
import { NewUser, User, users } from "../schema.js";


export type UserResponse = Omit<User, "hashedPassword">

export async function createUser(user: NewUser): Promise<UserResponse> {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning({
            id: users.id,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            email: users.email
        });
    return result;
}

export async function deleteALLUsers() {
    await db.delete(users);
}

export async function getAllUsers() {
    const allUsers = await db.query.users.findMany();

    return allUsers;
}

export async function getSingleUserQuery(userEmail: string) {
    const user = await db.query.users.findFirst({
        where: (users, {eq}) => eq(users.email, userEmail),
    })

    return user;
}