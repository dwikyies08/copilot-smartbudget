import type { BudgetPrediction, InsertBudgetPrediction } from "@/types"

export type PredictionWithInflation = BudgetPrediction & {
  priceChangePercent?: number
  isPriceRising?: boolean
}

export type CreatePredictionDTO = Omit<
  InsertBudgetPrediction,
  "id" | "userId" | "updatedAt"
>

export type UpdatePredictionDTO = Partial<CreatePredictionDTO> & {
  id: string
}

