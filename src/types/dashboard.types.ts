import type { Wallet, CategoryWithUsage, TransactionWithRelations } from "@/types"

export type CashflowChartPoint = {
  month: string
  income: number
  expense: number
  net: number
}

export type CategoryBudgetStatus = {
  categoryId: string
  categoryName: string
  budgetLimit: number
  totalSpent: number
  percentageUsed: number
  isOverBudget: boolean
}

export type DashboardOverviewData = {
  totalBalance: number
  walletCount: number
  thisMonthIncome: number
  thisMonthExpense: number
  thisMonthNet: number
  activeShoppingCount: number
  cashflowSeries: CashflowChartPoint[]
  categoryBudgets: CategoryBudgetStatus[]
  recentTransactions: TransactionWithRelations[]
}

