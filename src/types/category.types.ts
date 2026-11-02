import type { Category, InsertCategory, PaginationParams } from "@/types"

export type CategoryType = "income" | "expense"

export type CategoryWithUsage = Category & {
  totalSpent?: number
  transactionCount?: number
  isOverBudget?: boolean
  percentageUsed?: number
}

export type CategorySummary = {
  totalIncomeCategories: number
  totalExpenseCategories: number
  totalBudgetLimit: number
  categories: Category[]
}

export type GetCategoriesFilterParams = PaginationParams & {
  userId: string
  type?: CategoryType
}

export type CreateCategoryDTO = Omit<InsertCategory, "id" | "userId">
export type UpdateCategoryDTO = Partial<CreateCategoryDTO> & { id: string }

