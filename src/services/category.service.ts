import { and, asc, count, desc, eq, or, sql, type AnyColumn } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, transactions } from "@/lib/schema"
import type { Category, PaginatedResult } from "@/types"
import type {
  CategoryType,
  CategoryWithUsage,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category.types"

export async function getCategoriesByUserId(
  userId: string,
  type?: CategoryType
): Promise<Category[]> {
  const conditions = [eq(categories.userId, userId)]
  if (type) {
    conditions.push(eq(categories.type, type))
  }

  return db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(categories.name)
}

export async function getCategoriesPaginated({
  userId,
  pageIndex = 0,
  pageSize = 10,
  search = "",
  sortBy = "name",
  sortOrder = "asc",
  type,
}: {
  userId: string
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
  type?: CategoryType
}): Promise<PaginatedResult<CategoryWithUsage>> {
  const offset = pageIndex * pageSize
  const conditions = [eq(categories.userId, userId)]

  if (type) {
    conditions.push(eq(categories.type, type))
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    conditions.push(
      or(
        sql`lower(${categories.name}) like ${searchTerm}`,
        sql`lower(${categories.type}) like ${searchTerm}`
      )!
    )
  }

  const whereClause = and(...conditions)

  const sortableColumns: Record<string, AnyColumn> = {
    name: categories.name,
    type: categories.type,
    budgetLimit: categories.budgetLimit,
  }

  const column = sortableColumns[sortBy] ?? categories.name
  const order = sortOrder === "asc" ? asc(column) : desc(column)

  const date = new Date()
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime()
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).getTime()

  const [rows, total, spendResults] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(order)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(categories).where(whereClause),
    db
      .select({
        categoryId: transactions.categoryId,
        totalSpent: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
        count: sql<number>`count(${transactions.id})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.transactionDate} >= ${startOfMonth}`,
          sql`${transactions.transactionDate} <= ${endOfMonth}`
        )
      )
      .groupBy(transactions.categoryId),
  ])

  const spendMap = new Map<string, { totalSpent: number; count: number }>()
  for (const item of spendResults) {
    if (item.categoryId) {
      spendMap.set(item.categoryId, {
        totalSpent: Number(item.totalSpent),
        count: Number(item.count),
      })
    }
  }

  const enrichedRows: CategoryWithUsage[] = rows.map((cat) => {
    const spend = spendMap.get(cat.id)
    const totalSpent = spend?.totalSpent ?? 0
    const txCount = spend?.count ?? 0
    const limit = cat.budgetLimit ?? 0
    const percentageUsed =
      limit > 0 ? Math.round((totalSpent / limit) * 100) : 0
    const isOverBudget = limit > 0 && totalSpent > limit

    return {
      ...cat,
      totalSpent,
      transactionCount: txCount,
      percentageUsed,
      isOverBudget,
    }
  })

  const rowCount = Number(total[0]?.count ?? 0)

  return {
    rows: enrichedRows,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  }
}

export async function getCategoryById(
  id: string,
  userId: string
): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))

  return result[0] ?? null
}

export async function getCategoriesWithMonthlySpend(
  userId: string,
  date: Date = new Date()
): Promise<CategoryWithUsage[]> {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime()
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime()

  const categoryList = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.type, categories.name)

  const spendResults = await db
    .select({
      categoryId: transactions.categoryId,
      totalSpent: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      count: sql<number>`count(${transactions.id})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.transactionDate} >= ${startOfMonth}`,
        sql`${transactions.transactionDate} <= ${endOfMonth}`
      )
    )
    .groupBy(transactions.categoryId)

  const spendMap = new Map<string, { totalSpent: number; count: number }>()
  for (const item of spendResults) {
    if (item.categoryId) {
      spendMap.set(item.categoryId, {
        totalSpent: Number(item.totalSpent),
        count: Number(item.count),
      })
    }
  }

  return categoryList.map((cat) => {
    const spend = spendMap.get(cat.id)
    const totalSpent = spend?.totalSpent ?? 0
    const countVal = spend?.count ?? 0
    const limit = cat.budgetLimit ?? 0
    const percentageUsed = limit > 0 ? Math.round((totalSpent / limit) * 100) : 0
    const isOverBudget = limit > 0 && totalSpent > limit

    return {
      ...cat,
      totalSpent,
      transactionCount: countVal,
      percentageUsed,
      isOverBudget,
    }
  })
}

export async function createCategory(
  userId: string,
  data: CreateCategoryDTO
): Promise<Category> {
  const [created] = await db
    .insert(categories)
    .values({
      ...data,
      userId,
    })
    .returning()

  return created
}

export async function updateCategory(
  userId: string,
  data: UpdateCategoryDTO
): Promise<Category | null> {
  const { id, ...updateData } = data
  const [updated] = await db
    .update(categories)
    .set(updateData)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning()

  return updated ?? null
}

export async function deleteCategory(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning()

  return result.length > 0
}
