import type {
  MonthlyShoppingTemplate,
  InsertMonthlyShoppingTemplate,
  MonthlyTemplateItem,
  InsertMonthlyTemplateItem,
  TransactionShoppingItem,
  InsertTransactionShoppingItem,
  Transaction,
} from "@/types"

export type TemplateItemDTO = {
  productName: string
  defaultQuantity: number
  estimatedPrice: number
}

export type TemplateWithItems = MonthlyShoppingTemplate & {
  items: MonthlyTemplateItem[]
  totalEstimatedPrice: number
  itemCount: number
}

export type CreateShoppingTemplateDTO = {
  title: string
  isActive?: boolean
  items: TemplateItemDTO[]
}

export type UpdateShoppingTemplateDTO = Partial<CreateShoppingTemplateDTO> & {
  id: string
}

export type ShoppingTransactionDetail = Transaction & {
  items: TransactionShoppingItem[]
  checkedCount: number
  totalItems: number
  totalActualPrice: number
}

