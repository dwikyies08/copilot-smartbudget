import * as z from "zod"

export const createWalletSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama dompet wajib diisi")
    .max(50, "Nama dompet maksimal 50 karakter"),
  balance: z.coerce
    .number()
    .min(0, "Saldo awal tidak boleh negatif")
    .default(0),
  currency: z.string().trim().min(1, "Mata uang wajib diisi").default("IDR"),
})

export const updateWalletSchema = createWalletSchema.partial().extend({
  id: z.string().min(1, "ID dompet wajib diisi"),
})

export const deleteWalletSchema = z.object({
  id: z.string().min(1, "ID dompet wajib diisi"),
})

export type CreateWalletInput = z.infer<typeof createWalletSchema>
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>
export type DeleteWalletInput = z.infer<typeof deleteWalletSchema>
