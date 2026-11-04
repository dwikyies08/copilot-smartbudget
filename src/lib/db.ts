// lib/db.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

if (authToken) {
  try {
    const payloadPart = authToken.split(".")[1];
    if (payloadPart) {
      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8")
      );
      if (payload?.a === "ro") {
        console.warn(
          "\n⚠️ [DB WARNING] TURSO_AUTH_TOKEN di .env.local berstatus READ-ONLY (\"a\": \"ro\"). " +
            "Operasi INSERT / UPDATE / DELETE akan gagal. Silakan buat token baru dengan akses Read & Write (\"rw\") di dashboard Turso.\n"
        );
      }
    }
  } catch {
    // Abaikan jika token bukan format JWT standar
  }
}

/**
 * Initialize Turso libSQL client using environment variables.
 * Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are defined in .env.local.
 */
export const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken,
});

// Drizzle ORM instance bound to the schema defined in lib/schema.ts
export const db = drizzle(client, { schema });
