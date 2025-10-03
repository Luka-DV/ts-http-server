import { relations } from "drizzle-orm";
import { integer } from "drizzle-orm/gel-core";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", {length: 256}).unique().notNull(),
});

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
    .$onUpdate(() => new Date()),
    body: text("body").notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
})

export const  usersRelations = relations(users, ({many}) => ({
    chirps: many(chirps),
}));

export const chirpsRelatoins = relations(chirps, ({one}) => ({
    user: one(users, {fields: [chirps.userId], references: [users.id]}),
}))

export type NewUser = typeof users.$inferInsert;

export type NewChirp = typeof chirps.$inferInsert;

