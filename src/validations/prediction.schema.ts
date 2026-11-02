import * as z from "zod"

export const createPredictionSchema = z.object({
  productName: z.string().trim().min(1, "Nama produk wajib diisi").max(100),
  averagePrice: z.coerce.number().min(0, "Rata-rata harga tidak boleh negatif").default(0),
  predictedNextPrice: z.coerce.number().min(0, "Prediksi harga tidak boleh negatif").default(0),
  recommendedQuantity: z.coerce.number().int().min(1).default(1),
})

export const updatePredictionSchema = createPredictionSchema.partial().extend({
  id: z.string().min(1, "ID prediksi wajib diisi"),
})

export const deletePredictionSchema = z.object({
  id: z.string().min(1, "ID prediksi wajib diisi"),
})

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>
export type UpdatePredictionInput = z.infer<typeof updatePredictionSchema>
export type DeletePredictionInput = z.infer<typeof deletePredictionSchema>

