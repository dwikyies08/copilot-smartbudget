import { db } from "@/lib/db"
import { dokter, poliklinik } from "@/lib/schema"
import { eq } from "drizzle-orm"

// --- DOKTER ---
export const getAllDokter = async () => {
  return await db.select().from(dokter)
}

export const getDokterById = async (kodeDok: string) => {
  const result = await db
    .select()
    .from(dokter)
    .where(eq(dokter.KodeDok, kodeDok))
  return result[0] || null
}

export const createDokter = async (data: typeof dokter.$inferInsert) => {
  const result = await db.insert(dokter).values(data).returning()
  return result[0]
}

export const updateDokter = async (
  kodeDok: string,
  data: Partial<typeof dokter.$inferInsert>
) => {
  const result = await db
    .update(dokter)
    .set(data)
    .where(eq(dokter.KodeDok, kodeDok))
    .returning()
  return result[0]
}

export const deleteDokter = async (kodeDok: string) => {
  await db.delete(dokter).where(eq(dokter.KodeDok, kodeDok))
}

// --- POLIKLINIK ---
export const getAllPoliklinik = async () => {
  return await db.select().from(poliklinik)
}
