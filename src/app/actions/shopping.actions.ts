"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createTemplateSchema,
  updateTemplateSchema,
  deleteTemplateSchema,
  startShoppingSessionSchema,
  toggleShoppingItemSchema,
  formatZodErrors,
} from "@/validations"
import {
  getTemplatesPaginated,
  getTemplatesByUserId,
  getTemplateById,
  createTemplateWithItems,
  updateTemplateWithItems,
  deleteTemplate,
  generateTransactionFromTemplate,
  updateShoppingItemCheck,
  getActiveShoppingSession,
} from "@/services/shopping.service"
import type {
  ActionResponse,
  PaginatedResult,
  TemplateWithItems,
  ShoppingTransactionDetail,
} from "@/types"

export async function getTemplatesListAction(params: {
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}): Promise<PaginatedResult<TemplateWithItems>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    return await getTemplatesPaginated({
      userId: session.user.id,
      ...params,
    })
  } catch (error) {
    console.error("[GET_TEMPLATES_LIST_ERROR]", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

export async function fetchTemplatesAction(): Promise<
  ActionResponse<TemplateWithItems[]>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const templates = await getTemplatesByUserId(session.user.id)
    return { success: true, data: templates }
  } catch (error) {
    console.error("[FETCH_TEMPLATES_ERROR]", error)
    return { success: false, error: "Gagal memuat template belanja" }
  }
}

export async function getTemplateByIdAction(
  id: string
): Promise<ActionResponse<TemplateWithItems>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const template = await getTemplateById(id, session.user.id)
    if (!template) {
      return { success: false, error: "Template tidak ditemukan" }
    }

    return { success: true, data: template }
  } catch (error) {
    console.error("[GET_TEMPLATE_BY_ID_ERROR]", error)
    return { success: false, error: "Gagal memuat detail template belanja" }
  }
}

export async function fetchActiveShoppingSessionAction(): Promise<
  ActionResponse<ShoppingTransactionDetail | null>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const data = await getActiveShoppingSession(session.user.id)
    return { success: true, data }
  } catch (error) {
    console.error("[FETCH_ACTIVE_SESSION_ERROR]", error)
    return { success: false, error: "Gagal memuat sesi belanja aktif" }
  }
}

export async function createTemplateAction(
  input: unknown
): Promise<ActionResponse<TemplateWithItems>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = createTemplateSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data template gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await createTemplateWithItems(session.user.id, parsed.data)

    revalidatePath("/shopping")

    return {
      success: true,
      message: "Template belanja berhasil dibuat",
      data: created,
    }
  } catch (error) {
    console.error("[CREATE_TEMPLATE_ERROR]", error)
    return { success: false, error: "Gagal membuat template belanja" }
  }
}

export async function updateTemplateAction(
  input: unknown
): Promise<ActionResponse<TemplateWithItems>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = updateTemplateSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data template gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const updated = await updateTemplateWithItems(session.user.id, parsed.data)
    if (!updated) {
      return {
        success: false,
        error: "Template tidak ditemukan atau gagal diperbarui",
      }
    }

    revalidatePath("/shopping")
    revalidatePath(`/shopping/${parsed.data.id}`)

    return {
      success: true,
      message: "Template belanja berhasil diperbarui",
      data: updated,
    }
  } catch (error) {
    console.error("[UPDATE_TEMPLATE_ERROR]", error)
    return { success: false, error: "Gagal memperbarui template belanja" }
  }
}

export async function deleteTemplateAction(
  input: unknown
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = typeof input === "string" ? { id: input } : input
    const parsed = deleteTemplateSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "ID template tidak valid" }
    }

    const success = await deleteTemplate(parsed.data.id, session.user.id)
    if (!success) {
      return { success: false, error: "Template tidak ditemukan" }
    }

    revalidatePath("/shopping")

    return {
      success: true,
      message: "Template belanja berhasil dihapus",
    }
  } catch (error) {
    console.error("[DELETE_TEMPLATE_ERROR]", error)
    return { success: false, error: "Gagal menghapus template" }
  }
}

export async function startShoppingSessionAction(
  input: unknown
): Promise<ActionResponse<ShoppingTransactionDetail>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = startShoppingSessionSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Parameter sesi belanja tidak valid",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const detail = await generateTransactionFromTemplate(
      session.user.id,
      parsed.data.templateId,
      parsed.data.walletId,
      parsed.data.categoryId,
      parsed.data.transactionDate
    )

    revalidatePath("/shopping")
    revalidatePath("/transactions")
    revalidatePath("/wallets")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Sesi belanja aktif berhasil dimulai",
      data: detail,
    }
  } catch (error) {
    console.error("[START_SHOPPING_SESSION_ERROR]", error)
    return { success: false, error: "Gagal memulai sesi belanja" }
  }
}

export async function toggleShoppingItemAction(
  input: unknown
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = toggleShoppingItemSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: "Data centang item tidak valid" }
    }

    const success = await updateShoppingItemCheck(
      parsed.data.itemId,
      session.user.id,
      parsed.data.isChecked,
      parsed.data.actualPrice
    )

    if (!success) {
      return { success: false, error: "Item belanja tidak ditemukan" }
    }

    revalidatePath("/shopping")
    revalidatePath("/transactions")
    revalidatePath("/wallets")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Status barang berhasil diperbarui",
    }
  } catch (error) {
    console.error("[TOGGLE_SHOPPING_ITEM_ERROR]", error)
    return { success: false, error: "Gagal memperbarui item belanja" }
  }
}
