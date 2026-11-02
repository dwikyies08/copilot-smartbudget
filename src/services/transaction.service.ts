import { and, asc, desc, eq, or, sql, type AnyColumn } from "drizzle-orm"
import { db } from "@/lib/db"
import { transactions, wallets, categories } from "@/lib/schema"
import type {
  Transaction,
  PaginatedResult,
  TransactionWithRelations,
  TransactionFilterParams,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionSummary,
} from "@/types"

export async function getTransactionsPaginated(
  params: TransactionFilterParams
): Promise<PaginatedResult<TransactionWithRelations>> {
  const {
    userId,
    walletId,
    categoryId,
    type,
    status,
    startDate,
    endDate,
    from,
    to,
    search,
    sortBy = "transactionDate",
    sortOrder = "desc",
    pageIndex = 0,
    pageSize = 10,
  } = params

  const conditions = [eq(transactions.userId, userId)]

  if (walletId) conditions.push(eq(transactions.walletId, walletId))
  if (categoryId) conditions.push(eq(transactions.categoryId, categoryId))
  if (type) conditions.push(eq(transactions.type, type))
  if (status) conditions.push(eq(transactions.status, status))

  const effectiveStart = startDate ?? (from ? new Date(from) : undefined)
  const effectiveEnd = endDate ?? (to ? new Date(to) : undefined)

  if (effectiveStart && !isNaN(effectiveStart.getTime())) {
    conditions.push(
      sql`${transactions.transactionDate} >= ${effectiveStart.getTime()}`
    )
  }
  if (effectiveEnd && !isNaN(effectiveEnd.getTime())) {
    conditions.push(
      sql`${transactions.transactionDate} <= ${effectiveEnd.getTime()}`
    )
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    conditions.push(
      or(
        sql`lower(${transactions.description}) like ${searchTerm}`,
        sql`lower(${transactions.referenceCode}) like ${searchTerm}`
      )!
    )
  }

  const whereClause = and(...conditions)

  const sortableColumns: Record<string, AnyColumn> = {
    transactionDate: transactions.transactionDate,
    amount: transactions.amount,
    description: transactions.description,
    type: transactions.type,
    status: transactions.status,
  }

  const column = sortableColumns[sortBy] ?? transactions.transactionDate
  const order = sortOrder === "asc" ? asc(column) : desc(column)

  const countResult = await db
    .select({ count: sql<number>`count(${transactions.id})` })
    .from(transactions)
    .where(whereClause)

  const rowCount = Number(countResult[0]?.count ?? 0)
  const pageCount = Math.ceil(rowCount / pageSize)

  const rows = await db
    .select({
      transaction: transactions,
      wallet: wallets,
      category: categories,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(whereClause)
    .orderBy(order, desc(transactions.createdAt))
    .limit(pageSize)
    .offset(pageIndex * pageSize)

  const formattedRows: TransactionWithRelations[] = rows.map((r) => ({
    ...r.transaction,
    wallet: r.wallet,
    category: r.category,
  }))

  return {
    rows: formattedRows,
    rowCount,
    pageCount,
  }
}

export async function getTransactionById(
  id: string,
  userId: string
): Promise<TransactionWithRelations | null> {
  const rows = await db
    .select({
      transaction: transactions,
      wallet: wallets,
      category: categories,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

  if (!rows[0]) return null

  return {
    ...rows[0].transaction,
    wallet: rows[0].wallet,
    category: rows[0].category,
  }
}

export async function createTransactionWithBalanceUpdate(
  userId: string,
  data: CreateTransactionDTO
): Promise<Transaction> {
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(transactions)
      .values({
        ...data,
        userId,
      })
      .returning()

    if (created.status === "completed") {
      const balanceChange =
        created.type === "income" ? created.amount : -created.amount

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${balanceChange}`,
        })
        .where(
          and(eq(wallets.id, created.walletId), eq(wallets.userId, userId))
        )
    }

    return created
  })
}

export async function updateTransactionWithBalanceUpdate(
  userId: string,
  data: UpdateTransactionDTO
): Promise<Transaction | null> {
  return await db.transaction(async (tx) => {
    const { id, ...updateData } = data

    const [existing] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

    if (!existing) return null

    // 1. Rollback balance dompet lama jika status sebelumnya completed
    if (existing.status === "completed") {
      const rollbackChange =
        existing.type === "income" ? -existing.amount : existing.amount

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${rollbackChange}`,
        })
        .where(
          and(eq(wallets.id, existing.walletId), eq(wallets.userId, userId))
        )
    }

    // 2. Update transaksi
    const [updated] = await tx
      .update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    if (!updated) return null

    // 3. Terapkan mutasi saldo baru jika status completed
    if (updated.status === "completed") {
      const newChange =
        updated.type === "income" ? updated.amount : -updated.amount

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${newChange}`,
        })
        .where(
          and(eq(wallets.id, updated.walletId), eq(wallets.userId, userId))
        )
    }

    return updated
  })
}

export async function deleteTransactionWithBalanceRollback(
  id: string,
  userId: string
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))

    if (!existing) return false

    if (existing.status === "completed") {
      const rollbackChange =
        existing.type === "income" ? -existing.amount : existing.amount

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${rollbackChange}`,
        })
        .where(
          and(eq(wallets.id, existing.walletId), eq(wallets.userId, userId))
        )
    }

    const deleted = await tx
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning()

    return deleted.length > 0
  })
}

export async function getTransactionSummaryByUserId(
  userId: string
): Promise<TransactionSummary> {
  const result = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      count: sql<number>`count(${transactions.id})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, "completed")
      )
    )
    .groupBy(transactions.type)

  let totalIncome = 0
  let totalExpense = 0
  let transactionCount = 0

  for (const item of result) {
    const val = Number(item.total)
    const cnt = Number(item.count)
    transactionCount += cnt
    if (item.type === "income") totalIncome += val
    if (item.type === "expense") totalExpense += val
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    transactionCount,
  }
}
