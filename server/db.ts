import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { InsertUser, type User, users } from "@/drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

type DbUser = typeof users.$inferSelect;
type UpsertUserInput = {
  openId: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  loginMethod?: string | null;
  role?: User["role"];
  lastSignedIn?: Date;
};

function getOwnerRole(openId: string, role?: User["role"]): User["role"] {
  if (role) return role;
  if (ENV.ownerOpenId && openId === ENV.ownerOpenId) {
    return "admin";
  }

  return "user";
}

function normalizeName(name?: string | null, email?: string | null) {
  return name?.trim() || email?.trim() || "Usuario";
}

// DATABASE CONNECTION (SINGLETON)
export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL nao definida");
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    _db = drizzle(pool);
  }

  return _db;
}

export async function createUser(user: InsertUser) {
  const db = getDb();
  const result = await db.insert(users).values(user).returning();
  return result[0] ?? null;
}

export async function getUserById(id: number) {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function findUserByEmailOrOpenId(email: string, openId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.openId, openId)))
    .limit(1);

  return result[0] ?? null;
}

export async function updateUserLastSignedIn(id: number, lastSignedIn: Date = new Date()) {
  const db = getDb();
  const result = await db
    .update(users)
    .set({
      lastSignedIn,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return result[0] ?? null;
}

export async function upsertUser(user: UpsertUserInput): Promise<DbUser | null> {
  const db = getDb();

  const name = normalizeName(user.name, user.email);
  const loginMethod = user.loginMethod?.trim() || "google";
  const role = getOwnerRole(user.openId, user.role);
  const lastSignedIn = user.lastSignedIn ?? new Date();
  const existing = await getUserByOpenId(user.openId);

  if (!existing) {
    const inserted = await db
      .insert(users)
      .values({
        openId: user.openId,
        name,
        email: user.email ?? null,
        password: user.password ?? null,
        loginMethod,
        role,
        lastSignedIn,
        updatedAt: new Date(),
      })
      .returning();

    return inserted[0] ?? null;
  }

  const nextEmail = user.email !== undefined ? user.email : existing.email;
  const nextName = user.name !== undefined ? normalizeName(user.name, nextEmail) : existing.name;
  const nextPassword = user.password !== undefined ? user.password : existing.password;

  const updated = await db
    .update(users)
    .set({
      name: nextName,
      email: nextEmail,
      password: nextPassword,
      loginMethod,
      role,
      lastSignedIn,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, existing.id), eq(users.openId, user.openId)))
    .returning();

  return updated[0] ?? null;
}
