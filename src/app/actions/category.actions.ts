"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  formatZodErrors,
} from "@/validations"
import {
  getCategoriesByUserId,
  getCategoriesPaginated,
  getCategoriesWithMonthlySpend,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service"
import type {
  ActionResponse,
  Category,
  CategoryType,
  CategoryWithUsage,
  PaginatedResult,
} from "@/types"

export async function getCategoriesListAction(params: {
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
  type?: CategoryType
}): Promise<PaginatedResult<CategoryWithUsage>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    return await getCategoriesPaginated({
      userId: session.user.id,
      ...params,
    })
  } catch (error) {
    console.error("[GET_CATEGORIES_LIST_ERROR]", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

export async function fetchCategoriesAction(
  type?: "income" | "expense"
): Promise<ActionResponse<Category[]>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const data = await getCategoriesByUserId(session.user.id, type)
    return { success: true, data }
  } catch (error) {
    console.error("[FETCH_CATEGORIES_ERROR]", error)
    return { success: false, error: "Gagal memuat kategori" }
  }
}

export async function fetchCategoriesWithSpendAction(): Promise<
  ActionResponse<CategoryWithUsage[]>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const data = await getCategoriesWithMonthlySpend(session.user.id)
    return { success: true, data }
  } catch (error) {
    console.error("[FETCH_CATEGORIES_WITH_SPEND_ERROR]", error)
    return { success: false, error: "Gagal memuat penggunaan kategori" }
  }
}

export async function getCategoryByIdAction(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const category = await getCategoryById(id, session.user.id)
    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error("[GET_CATEGORY_BY_ID_ERROR]", error)
    return { success: false, error: "Gagal mengambil data kategori" }
  }
}

export async function createCategoryAction(
  input: unknown | FormData
): Promise<ActionResponse<Category>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = createCategorySchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await createCategory(session.user.id, parsed.data)

    revalidatePath("/categories")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: created,
    }
  } catch (error) {
    console.error("[CREATE_CATEGORY_ERROR]", error)
    return { success: false, error: "Gagal menambahkan kategori" }
  }
}

export async function updateCategoryAction(
  input: unknown | FormData
): Promise<ActionResponse<Category>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = updateCategorySchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const updated = await updateCategory(session.user.id, parsed.data)
    if (!updated) {
      return { success: false, error: "Kategori tidak ditemukan atau gagal diubah" }
    }

    revalidatePath("/categories")
    revalidatePath(`/categories/${parsed.data.id}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updated,
    }
  } catch (error) {
    console.error("[UPDATE_CATEGORY_ERROR]", error)
    return { success: false, error: "Gagal memperbarui kategori" }
  }
}

export async function deleteCategoryAction(
  input: unknown
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof input === "string"
        ? { id: input }
        : input

    const parsed = deleteCategorySchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "ID kategori tidak valid" }
    }

    const success = await deleteCategory(parsed.data.id, session.user.id)
    if (!success) {
      return { success: false, error: "Kategori tidak ditemukan atau gagal dihapus" }
    }

    revalidatePath("/categories")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Kategori berhasil dihapus",
    }
  } catch (error) {
    console.error("[DELETE_CATEGORY_ERROR]", error)
    return { success: false, error: "Gagal menghapus kategori" }
  }
}
