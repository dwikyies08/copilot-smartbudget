import type { Wallet, InsertWallet, PaginationParams } from "@/types"

export type WalletSummary = {
  totalBalance: number
  walletCount: number
  wallets: Wallet[]
}

export type WalletWithStats = Wallet & {
  totalIncome?: number
  totalExpense?: number
}

export type GetWalletsFilterParams = PaginationParams & {
  userId: string
  currency?: string
}

export type CreateWalletDTO = Omit<InsertWallet, "id" | "userId">
export type UpdateWalletDTO = Partial<CreateWalletDTO> & { id: string }
