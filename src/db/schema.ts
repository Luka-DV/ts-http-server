import { isNull, relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", {length: 256}).unique().notNull(),
    hashedPassword: varchar("hashed_password").notNull().default("unset"),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;


export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
        .$onUpdate(() => new Date()),
    body: varchar("body", {length: 140}).notNull(),
    userId: uuid("user_id")
        .references(() => users.id, {onDelete: "cascade"})
        .notNull(),
});

export type NewChirp = typeof chirps.$inferInsert;


export const refreshTokens = pgTable("refresh_tokens", {
    token: varchar("token", {length: 256}).primaryKey(), // unique and not null values
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("user_id")
        .notNull()
        .unique() // only one token per user
        .references(() => users.id, {onDelete: "cascade"}),
    expiresAt: timestamp("expires_at").$defaultFn(() => {
        const date = new Date();
        date.setDate(date.getDate() + 60); // adds 60 days
        return date;
    }),
    revokedAt: timestamp("revoked_at") // null by default
});


// relations API

export const usersRelations = relations(users, ({many, one}) => ({
    chirps: many(chirps),
    refreshToken: one(refreshTokens)
}));

export const chirpsRelations = relations(chirps, ({one}) => ({
    user: one(users, {
        fields: [chirps.userId], 
        references: [users.id]
    }),
}));

export const refreshTokenRelations = relations(refreshTokens, ({one}) => ({
    user: one(users, { 
        fields: [refreshTokens.userId], 
        references: [users.id]
    }),
}));


