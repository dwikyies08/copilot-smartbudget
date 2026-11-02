import type {
  Transaction,
  InsertTransaction,
  Wallet,
  Category,
  PaginationParams,
  PaginatedResult,
} from "@/types"

export type TransactionType = "income" | "expense"
export type TransactionStatus = "pending" | "completed" | "failed"
export type TransactionSource = "manual" | "email_sync" | "shopping_list"

export type TransactionWithRelations = Transaction & {
  wallet?: Wallet | null
  category?: Category | null
}

export type TransactionFilterParams = PaginationParams & {
  userId: string
  walletId?: string
  categoryId?: string
  type?: TransactionType
  status?: TransactionStatus
  startDate?: Date
  endDate?: Date
}

export type CreateTransactionDTO = Omit<
  InsertTransaction,
  "id" | "userId" | "createdAt"
>

export type UpdateTransactionDTO = Partial<CreateTransactionDTO> & {
  id: string
}

export type TransactionSummary = {
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}

