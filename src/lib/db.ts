// lib/db.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Initialize Turso libSQL client using environment variables.
 * Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are defined in .env.local.
 */
export const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle ORM instance bound to the schema defined in lib/schema.ts
export const db = drizzle(client, { schema });
