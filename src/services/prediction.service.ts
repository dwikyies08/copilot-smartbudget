import { and, asc, desc, eq, like, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  budgetPredictions,
  transactionShoppingItems,
  transactions,
} from "@/lib/schema"
import type { BudgetPrediction, PaginatedResult } from "@/types"
import type {
  PredictionWithInflation,
  CreatePredictionDTO,
  UpdatePredictionDTO,
} from "@/types/prediction.types"

function enrichWithInflation(p: BudgetPrediction): PredictionWithInflation {
  const avg = p.averagePrice ?? 0
  const next = p.predictedNextPrice ?? 0
  const priceChangePercent =
    avg > 0 ? Math.round(((next - avg) / avg) * 100) : 0
  const isPriceRising = next > avg

  return {
    ...p,
    priceChangePercent,
    isPriceRising,
  }
}

export async function getPredictionsPaginated({
  userId,
  pageIndex,
  pageSize,
  search = "",
  sortBy = "updatedAt",
  sortOrder = "desc",
}: {
  userId: string
  pageIndex: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}): Promise<PaginatedResult<PredictionWithInflation>> {
  const safePageIndex = Math.max(0, pageIndex)
  const safePageSize = Math.min(100, Math.max(1, pageSize))
  const offset = safePageIndex * safePageSize

  const conditions = [eq(budgetPredictions.userId, userId)]
  if (search.trim()) {
    conditions.push(like(budgetPredictions.productName, `%${search.trim()}%`))
  }
  const whereClause = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(budgetPredictions)
    .where(whereClause)

  const rowCount = Number(count ?? 0)
  const pageCount = Math.ceil(rowCount / safePageSize)

  const orderDirection = sortOrder === "asc" ? asc : desc
  const orderColumn =
    sortBy === "productName"
      ? budgetPredictions.productName
      : sortBy === "averagePrice"
        ? budgetPredictions.averagePrice
        : sortBy === "predictedNextPrice"
          ? budgetPredictions.predictedNextPrice
          : sortBy === "recommendedQuantity"
            ? budgetPredictions.recommendedQuantity
            : budgetPredictions.updatedAt

  const rows = await db
    .select()
    .from(budgetPredictions)
    .where(whereClause)
    .orderBy(orderDirection(orderColumn))
    .limit(safePageSize)
    .offset(offset)

  return {
    rows: rows.map(enrichWithInflation),
    rowCount,
    pageCount,
  }
}

export async function getPredictionsByUserId(
  userId: string
): Promise<PredictionWithInflation[]> {
  const rows = await db
    .select()
    .from(budgetPredictions)
    .where(eq(budgetPredictions.userId, userId))
    .orderBy(desc(budgetPredictions.updatedAt))

  return rows.map(enrichWithInflation)
}

export async function getPredictionById(
  id: string,
  userId: string
): Promise<PredictionWithInflation | null> {
  const rows = await db
    .select()
    .from(budgetPredictions)
    .where(
      and(eq(budgetPredictions.id, id), eq(budgetPredictions.userId, userId))
    )

  if (!rows[0]) return null
  return enrichWithInflation(rows[0])
}

export async function recalculateBudgetPredictions(
  userId: string
): Promise<number> {
  // Ambil semua item belanja nyata dari transaksi user
  const purchaseItems = await db
    .select({
      productName: transactionShoppingItems.productName,
      actualPrice: transactionShoppingItems.actualPrice,
      quantity: transactionShoppingItems.quantity,
    })
    .from(transactionShoppingItems)
    .innerJoin(
      transactions,
      eq(transactionShoppingItems.transactionId, transactions.id)
    )
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactionShoppingItems.isChecked, true)
      )
    )

  if (purchaseItems.length === 0) return 0

  // Kelompokkan per nama produk
  const productStats = new Map<
    string,
    { totalSpent: number; totalQty: number; latestPrice: number }
  >()

  for (const item of purchaseItems) {
    const key = item.productName.trim().toLowerCase()
    const current = productStats.get(key) ?? {
      totalSpent: 0,
      totalQty: 0,
      latestPrice: item.actualPrice ?? 0,
    }
    const itemQty = item.quantity ?? 1
    const itemPrice = item.actualPrice ?? 0

    productStats.set(key, {
      totalSpent: current.totalSpent + itemPrice * itemQty,
      totalQty: current.totalQty + itemQty,
      latestPrice: itemPrice,
    })
  }

  let updatedCount = 0

  for (const [prodName, stats] of productStats.entries()) {
    const averagePrice =
      stats.totalQty > 0 ? Math.round(stats.totalSpent / stats.totalQty) : 0
    // Prediksi harga bulan berikutnya mengasumsikan inflasi moderat 3% atau harga terbaru
    const predictedNextPrice = Math.max(
      Math.round(averagePrice * 1.03),
      stats.latestPrice
    )
    const recommendedQuantity = Math.max(1, Math.round(stats.totalQty / 2))

    // Cek apakah data prediksi produk sudah ada
    const existing = await db
      .select()
      .from(budgetPredictions)
      .where(
        and(
          eq(budgetPredictions.userId, userId),
          eq(sql`lower(${budgetPredictions.productName})`, prodName)
        )
      )

    if (existing[0]) {
      await db
        .update(budgetPredictions)
        .set({
          averagePrice,
          predictedNextPrice,
          recommendedQuantity,
          updatedAt: new Date(),
        })
        .where(eq(budgetPredictions.id, existing[0].id))
    } else {
      await db.insert(budgetPredictions).values({
        userId,
        productName: prodName.toUpperCase(),
        averagePrice,
        predictedNextPrice,
        recommendedQuantity,
        updatedAt: new Date(),
      })
    }
    updatedCount++
  }

  return updatedCount
}

export async function createPrediction(
  userId: string,
  data: CreatePredictionDTO
): Promise<BudgetPrediction> {
  const [created] = await db
    .insert(budgetPredictions)
    .values({
      ...data,
      userId,
      updatedAt: new Date(),
    })
    .returning()

  return created
}

export async function updatePrediction(
  userId: string,
  data: UpdatePredictionDTO
): Promise<BudgetPrediction | null> {
  const { id, ...updateData } = data
  const [updated] = await db
    .update(budgetPredictions)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(eq(budgetPredictions.id, id), eq(budgetPredictions.userId, userId))
    )
    .returning()

  return updated ?? null
}

export async function deletePrediction(
  id: string,
  userId: string
): Promise<boolean> {
  const deleted = await db
    .delete(budgetPredictions)
    .where(
      and(eq(budgetPredictions.id, id), eq(budgetPredictions.userId, userId))
    )
    .returning()

  return deleted.length > 0
}
