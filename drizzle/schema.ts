import { pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: text("open_id").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    password: text("password"),
    loginMethod: text("login_method").notNull().default("local"),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
  },
  (table) => ({
    openIdUniqueIdx: uniqueIndex("users_open_id_unique").on(table.openId),
    emailUniqueIdx: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
