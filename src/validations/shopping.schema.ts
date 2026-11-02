import * as z from "zod"

export const templateItemSchema = z.object({
  productName: z.string().trim().min(1, "Nama produk wajib diisi").max(100),
  defaultQuantity: z.coerce.number().int().min(1, "Jumlah minimal 1").default(1),
  estimatedPrice: z.coerce.number().min(0, "Estimasi harga tidak boleh negatif").default(0),
})

export const createTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul template belanja wajib diisi")
    .max(100, "Judul template maksimal 100 karakter"),
  isActive: z.boolean().default(true),
  items: z.array(templateItemSchema).min(1, "Minimal masukkan 1 barang belanjaan"),
})

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().min(1, "ID template wajib diisi"),
})

export const deleteTemplateSchema = z.object({
  id: z.string().min(1, "ID template wajib diisi"),
})

export const startShoppingSessionSchema = z.object({
  templateId: z.string().min(1, "Template wajib dipilih"),
  walletId: z.string().min(1, "Dompet sumber dana wajib dipilih"),
  categoryId: z.string().optional().nullable(),
  transactionDate: z.coerce.date().default(() => new Date()),
})

export const toggleShoppingItemSchema = z.object({
  itemId: z.string().min(1, "ID item belanja wajib diisi"),
  isChecked: z.boolean(),
  actualPrice: z.coerce.number().min(0).optional(),
})

export const updateShoppingItemSchema = z.object({
  itemId: z.string().min(1, "ID item belanja wajib diisi"),
  quantity: z.coerce.number().int().min(1).optional(),
  actualPrice: z.coerce.number().min(0).optional(),
})

export type TemplateItemInput = z.infer<typeof templateItemSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type StartShoppingSessionInput = z.infer<typeof startShoppingSessionSchema>
export type ToggleShoppingItemInput = z.infer<typeof toggleShoppingItemSchema>
export type UpdateShoppingItemInput = z.infer<typeof updateShoppingItemSchema>

