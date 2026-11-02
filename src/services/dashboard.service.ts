import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  wallets,
  categories,
  transactions,
  transactionShoppingItems,
} from "@/lib/schema"
import type {
  DashboardOverviewData,
  CashflowChartPoint,
  CategoryBudgetStatus,
  TransactionWithRelations,
} from "@/types"

export async function getDashboardOverview(
  userId: string
): Promise<DashboardOverviewData> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).getTime()

  // 1. Total Saldo & Jumlah Dompet
  const walletRows = await db
    .select({
      total: sql<number>`coalesce(sum(${wallets.balance}), 0)`,
      count: sql<number>`count(${wallets.id})`,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))

  const totalBalance = Number(walletRows[0]?.total ?? 0)
  const walletCount = Number(walletRows[0]?.count ?? 0)

  // 2. Arus Kas Bulan Ini (Pemasukan vs Pengeluaran)
  const monthlyFlowRows = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, "completed"),
        sql`${transactions.transactionDate} >= ${startOfMonth}`,
        sql`${transactions.transactionDate} <= ${endOfMonth}`
      )
    )
    .groupBy(transactions.type)

  let thisMonthIncome = 0
  let thisMonthExpense = 0
  for (const row of monthlyFlowRows) {
    if (row.type === "income") thisMonthIncome = Number(row.total)
    if (row.type === "expense") thisMonthExpense = Number(row.total)
  }
  const thisMonthNet = thisMonthIncome - thisMonthExpense

  // 3. Status Anggaran Kategori Pengeluaran
  const categoryList = await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.userId, userId), eq(categories.type, "expense"))
    )

  const categorySpendRows = await db
    .select({
      categoryId: transactions.categoryId,
      totalSpent: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        sql`${transactions.transactionDate} >= ${startOfMonth}`,
        sql`${transactions.transactionDate} <= ${endOfMonth}`
      )
    )
    .groupBy(transactions.categoryId)

  const spendMap = new Map<string, number>()
  for (const s of categorySpendRows) {
    if (s.categoryId) {
      spendMap.set(s.categoryId, Number(s.totalSpent))
    }
  }

  const categoryBudgets: CategoryBudgetStatus[] = categoryList.map((c) => {
    const totalSpent = spendMap.get(c.id) ?? 0
    const limit = c.budgetLimit ?? 0
    const percentageUsed = limit > 0 ? Math.round((totalSpent / limit) * 100) : 0
    return {
      categoryId: c.id,
      categoryName: c.name,
      budgetLimit: limit,
      totalSpent,
      percentageUsed,
      isOverBudget: limit > 0 && totalSpent > limit,
    }
  })

  // 4. Data Tren Arus Kas 6 Bulan Terakhir
  const cashflowSeries: CashflowChartPoint[] = []
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ]

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    const mEnd = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ).getTime()

    const monthRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, "completed"),
          sql`${transactions.transactionDate} >= ${mStart}`,
          sql`${transactions.transactionDate} <= ${mEnd}`
        )
      )
      .groupBy(transactions.type)

    let inc = 0
    let exp = 0
    for (const r of monthRows) {
      if (r.type === "income") inc = Number(r.total)
      if (r.type === "expense") exp = Number(r.total)
    }

    cashflowSeries.push({
      month: `${monthNames[d.getMonth()]}`,
      income: inc,
      expense: exp,
      net: inc - exp,
    })
  }

  // 5. Transaksi Terakhir (5 Transaksi)
  const recentRows = await db
    .select({
      transaction: transactions,
      wallet: wallets,
      category: categories,
    })
    .from(transactions)
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
    .limit(5)

  const recentTransactions: TransactionWithRelations[] = recentRows.map(
    (r) => ({
      ...r.transaction,
      wallet: r.wallet,
      category: r.category,
    })
  )

  // 6. Belanja aktif yang belum selesai
  const activeShoppingCountRows = await db
    .select({
      count: sql<number>`count(distinct ${transactions.id})`,
    })
    .from(transactions)
    .innerJoin(
      transactionShoppingItems,
      eq(transactions.id, transactionShoppingItems.transactionId)
    )
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactionShoppingItems.isChecked, false)
      )
    )

  const activeShoppingCount = Number(activeShoppingCountRows[0]?.count ?? 0)

  return {
    totalBalance,
    walletCount,
    thisMonthIncome,
    thisMonthExpense,
    thisMonthNet,
    activeShoppingCount,
    cashflowSeries,
    categoryBudgets,
    recentTransactions,
  }
}

