import { db } from "@/lib/db"
import { obat, jenisbiaya, pegawai } from "@/lib/schema"
import { eq } from "drizzle-orm"

// --- OBAT ---
export const getAllObat = async () => {
  return await db.select().from(obat)
}

export const getObatById = async (kodeObat: string) => {
  const result = await db.select().from(obat).where(eq(obat.KodeObat, kodeObat))
  return result[0] || null
}

export const createObat = async (data: typeof obat.$inferInsert) => {
  const result = await db.insert(obat).values(data).returning()
  return result[0]
}

export const updateObat = async (
  kodeObat: string,
  data: Partial<typeof obat.$inferInsert>
) => {
  const result = await db
    .update(obat)
    .set(data)
    .where(eq(obat.KodeObat, kodeObat))
    .returning()
  return result[0]
}

// --- JENIS BIAYA ---
export const getAllJenisBiaya = async () => {
  return await db.select().from(jenisbiaya)
}

// --- PEGAWAI ---
export const getAllPegawai = async () => {
  return await db.select().from(pegawai)
}
