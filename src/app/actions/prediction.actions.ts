"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createPredictionSchema,
  updatePredictionSchema,
  deletePredictionSchema,
  formatZodErrors,
} from "@/validations"
import {
  getPredictionsPaginated,
  getPredictionsByUserId,
  getPredictionById,
  recalculateBudgetPredictions,
  createPrediction,
  updatePrediction,
  deletePrediction,
} from "@/services/prediction.service"
import type {
  ActionResponse,
  BudgetPrediction,
  PaginatedResult,
  PredictionWithInflation,
} from "@/types"

export async function getPredictionsListAction(params: {
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}): Promise<PaginatedResult<PredictionWithInflation>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    return await getPredictionsPaginated({
      userId: session.user.id,
      ...params,
    })
  } catch (error) {
    console.error("[GET_PREDICTIONS_LIST_ERROR]", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

export async function fetchPredictionsAction(): Promise<
  ActionResponse<PredictionWithInflation[]>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const data = await getPredictionsByUserId(session.user.id)
    return { success: true, data }
  } catch (error) {
    console.error("[FETCH_PREDICTIONS_ERROR]", error)
    return { success: false, error: "Gagal memuat data prediksi harga" }
  }
}

export async function getPredictionByIdAction(
  id: string
): Promise<ActionResponse<PredictionWithInflation>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const prediction = await getPredictionById(id, session.user.id)
    if (!prediction) {
      return { success: false, error: "Data prediksi tidak ditemukan" }
    }

    return { success: true, data: prediction }
  } catch (error) {
    console.error("[GET_PREDICTION_BY_ID_ERROR]", error)
    return { success: false, error: "Gagal memuat detail prediksi produk" }
  }
}

export async function recalculatePredictionsAction(): Promise<
  ActionResponse<{ count: number }>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const count = await recalculateBudgetPredictions(session.user.id)

    revalidatePath("/insights")
    revalidatePath("/shopping")

    return {
      success: true,
      message: `Berhasil memperbarui kalkulasi prediksi untuk ${count} produk`,
      data: { count },
    }
  } catch (error) {
    console.error("[RECALCULATE_PREDICTIONS_ERROR]", error)
    return {
      success: false,
      error: "Gagal menghitung ulang prediksi anggaran",
    }
  }
}

export async function createPredictionAction(
  input: unknown
): Promise<ActionResponse<BudgetPrediction>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = createPredictionSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await createPrediction(session.user.id, parsed.data)

    revalidatePath("/insights")

    return {
      success: true,
      message: "Data prediksi produk berhasil ditambahkan",
      data: created,
    }
  } catch (error) {
    console.error("[CREATE_PREDICTION_ERROR]", error)
    return { success: false, error: "Gagal menambahkan data prediksi" }
  }
}

export async function updatePredictionAction(
  input: unknown
): Promise<ActionResponse<BudgetPrediction>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = updatePredictionSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const updated = await updatePrediction(session.user.id, parsed.data)
    if (!updated) {
      return {
        success: false,
        error: "Data prediksi tidak ditemukan atau gagal diperbarui",
      }
    }

    revalidatePath("/insights")
    revalidatePath(`/insights/${parsed.data.id}`)

    return {
      success: true,
      message: "Data prediksi produk berhasil diperbarui",
      data: updated,
    }
  } catch (error) {
    console.error("[UPDATE_PREDICTION_ERROR]", error)
    return { success: false, error: "Gagal memperbarui data prediksi" }
  }
}

export async function deletePredictionAction(
  input: unknown
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = typeof input === "string" ? { id: input } : input
    const parsed = deletePredictionSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "ID prediksi tidak valid" }
    }

    const success = await deletePrediction(parsed.data.id, session.user.id)
    if (!success) {
      return { success: false, error: "Data prediksi tidak ditemukan" }
    }

    revalidatePath("/insights")

    return {
      success: true,
      message: "Data prediksi berhasil dihapus",
    }
  } catch (error) {
    console.error("[DELETE_PREDICTION_ERROR]", error)
    return { success: false, error: "Gagal menghapus data prediksi" }
  }
}
