import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const getUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email))
  return result[0] || null
}

export const getUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
}

export const createUser = async (data: typeof users.$inferInsert) => {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}
