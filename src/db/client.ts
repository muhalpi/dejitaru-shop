import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  if (!dbInstance) {
    dbInstance = drizzle(neon(databaseUrl), { schema });
  }

  return dbInstance;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
