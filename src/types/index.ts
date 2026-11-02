import type {
  users,
  wallets,
  categories,
  transactions,
  emailSyncLogs,
  monthlyShoppingTemplates,
  monthlyTemplateItems,
  transactionShoppingItems,
  budgetPredictions,
} from "@/lib/schema"

// ==========================================
// 1. STANDARD SERVER ACTION & PAGINATION TYPES
// ==========================================

export type ActionResponse<T = undefined> = {
  success: boolean
  message?: string
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
}

export type PaginationParams = {
  pageIndex?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  from?: string
  to?: string
}

export type PaginatedResult<T> = {
  rows: T[]
  rowCount: number
  pageCount: number
}

// ==========================================
// 2. DATABASE ENTITY TYPES (INFERRED FROM DRIZZLE)
// ==========================================

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

export type Wallet = typeof wallets.$inferSelect
export type InsertWallet = typeof wallets.$inferInsert

export type Category = typeof categories.$inferSelect
export type InsertCategory = typeof categories.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type InsertTransaction = typeof transactions.$inferInsert

export type EmailSyncLog = typeof emailSyncLogs.$inferSelect
export type InsertEmailSyncLog = typeof emailSyncLogs.$inferInsert

export type MonthlyShoppingTemplate = typeof monthlyShoppingTemplates.$inferSelect
export type InsertMonthlyShoppingTemplate = typeof monthlyShoppingTemplates.$inferInsert

export type MonthlyTemplateItem = typeof monthlyTemplateItems.$inferSelect
export type InsertMonthlyTemplateItem = typeof monthlyTemplateItems.$inferInsert

export type TransactionShoppingItem = typeof transactionShoppingItems.$inferSelect
export type InsertTransactionShoppingItem = typeof transactionShoppingItems.$inferInsert

export type BudgetPrediction = typeof budgetPredictions.$inferSelect
export type InsertBudgetPrediction = typeof budgetPredictions.$inferInsert

export * from "./auth.types"
export * from "./wallet.types"
export * from "./category.types"
export * from "./transaction.types"
export * from "./shopping.types"
export * from "./prediction.types"
export * from "./email-sync.types"
export * from "./dashboard.types"


