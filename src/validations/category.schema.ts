import * as z from "zod"

export const categoryTypeEnum = z.enum(["income", "expense"])

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Nama kategori maksimal 50 karakter"),
  type: categoryTypeEnum,
  budgetLimit: z.coerce
    .number()
    .min(0, "Batas anggaran tidak boleh negatif")
    .default(0),
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1, "ID kategori wajib diisi"),
})

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
