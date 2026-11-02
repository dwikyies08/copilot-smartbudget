import * as z from "zod"

export const transactionTypeEnum = z.enum(["income", "expense"])
export const transactionStatusEnum = z.enum(["pending", "completed", "failed"])
export const transactionSourceEnum = z.enum(["manual", "email_sync", "shopping_list"])

export const createTransactionSchema = z.object({
  walletId: z.string().min(1, "Dompet wajib dipilih"),
  categoryId: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Jumlah nominal harus lebih dari 0"),
  type: transactionTypeEnum,
  description: z.string().trim().max(255, "Deskripsi maksimal 255 karakter").optional().nullable(),
  referenceCode: z.string().trim().max(100).optional().nullable(),
  status: transactionStatusEnum.default("completed"),
  source: transactionSourceEnum.default("manual"),
  transactionDate: z.coerce.date().default(() => new Date()),
})

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string().min(1, "ID transaksi wajib diisi"),
})

export const deleteTransactionSchema = z.object({
  id: z.string().min(1, "ID transaksi wajib diisi"),
})

export const filterTransactionSchema = z.object({
  walletId: z.string().optional(),
  categoryId: z.string().optional(),
  type: transactionTypeEnum.optional(),
  status: transactionStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  pageIndex: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional().default("transactionDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>
export type FilterTransactionInput = z.infer<typeof filterTransactionSchema>
