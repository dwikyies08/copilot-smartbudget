import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

export const getUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()
  const result = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
  return result[0] || null
}

export const getUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
}

export const createUser = async (data: typeof users.$inferInsert) => {
  const normalizedData = {
    ...data,
    email: data.email.trim().toLowerCase(),
  }
  const result = await db.insert(users).values(normalizedData).returning()
  return result[0]
}

export const updateUser = async (
  id: string,
  data: Partial<typeof users.$inferInsert>
) => {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()
  return result[0] || null
}

export const syncUserByEmail = async (params: {
  email: string
  name?: string | null
  image?: string | null
}) => {
  const existingUser = await getUserByEmail(params.email)
  if (!existingUser) return null

  const updated = await updateUser(existingUser.id, {
    name: existingUser.name || params.name || null,
    image: existingUser.image || params.image || null,
    emailVerified: existingUser.emailVerified || new Date(),
  })

  return updated || existingUser
}
