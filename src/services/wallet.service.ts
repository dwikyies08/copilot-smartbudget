import { and, asc, count, desc, eq, or, sql, type AnyColumn } from "drizzle-orm"
import { db } from "@/lib/db"
import { wallets } from "@/lib/schema"
import type { PaginatedResult, Wallet } from "@/types"
import type { CreateWalletDTO, UpdateWalletDTO } from "@/types/wallet.types"

export async function getWalletsByUserId(userId: string): Promise<Wallet[]> {
  return db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .orderBy(wallets.name)
}

export async function getWalletsPaginated({
  userId,
  pageIndex = 0,
  pageSize = 10,
  search = "",
  sortBy = "name",
  sortOrder = "asc",
}: {
  userId: string
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}): Promise<PaginatedResult<Wallet>> {
  const offset = pageIndex * pageSize
  const conditions = [eq(wallets.userId, userId)]

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    conditions.push(
      or(
        sql`lower(${wallets.name}) like ${searchTerm}`,
        sql`lower(${wallets.currency}) like ${searchTerm}`
      )!
    )
  }

  const whereClause = and(...conditions)

  const sortableColumns: Record<string, AnyColumn> = {
    name: wallets.name,
    balance: wallets.balance,
    currency: wallets.currency,
  }

  const column = sortableColumns[sortBy] ?? wallets.name
  const order = sortOrder === "asc" ? asc(column) : desc(column)

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(wallets)
      .where(whereClause)
      .orderBy(order)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(wallets).where(whereClause),
  ])

  const rowCount = Number(total[0]?.count ?? 0)

  return {
    rows,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  }
}

export async function getWalletById(
  id: string,
  userId: string
): Promise<Wallet | null> {
  const result = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))

  return result[0] ?? null
}

export async function getTotalBalanceByUserId(userId: string): Promise<number> {
  const result = await db
    .select({
      total: sql<number>`coalesce(sum(${wallets.balance}), 0)`,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))

  return Number(result[0]?.total ?? 0)
}

export async function createWallet(
  userId: string,
  data: CreateWalletDTO
): Promise<Wallet> {
  const [created] = await db
    .insert(wallets)
    .values({
      ...data,
      userId,
    })
    .returning()

  return created
}

export async function updateWallet(
  userId: string,
  data: UpdateWalletDTO
): Promise<Wallet | null> {
  const { id, ...updateData } = data
  const [updated] = await db
    .update(wallets)
    .set(updateData)
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
    .returning()

  return updated ?? null
}

export async function deleteWallet(
  id: string,
  userId: string
): Promise<Wallet | null> {
  const [deleted] = await db
    .delete(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
    .returning()

  return deleted ?? null
}
