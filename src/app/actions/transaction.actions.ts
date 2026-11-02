"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  filterTransactionSchema,
  formatZodErrors,
} from "@/validations"
import {
  getTransactionsPaginated,
  getTransactionById,
  createTransactionWithBalanceUpdate,
  updateTransactionWithBalanceUpdate,
  deleteTransactionWithBalanceRollback,
  getTransactionSummaryByUserId,
} from "@/services/transaction.service"
import type {
  ActionResponse,
  PaginatedResult,
  Transaction,
  TransactionWithRelations,
  TransactionSummary,
} from "@/types"

export async function getTransactionsListAction(
  filterInput?: unknown
): Promise<PaginatedResult<TransactionWithRelations>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    const parsed = filterTransactionSchema.safeParse(filterInput ?? {})
    if (!parsed.success) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    const { startDate, endDate, ...rest } = parsed.data

    return await getTransactionsPaginated({
      ...rest,
      userId: session.user.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  } catch (error) {
    console.error("[GET_TRANSACTIONS_LIST_ERROR]", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

export async function getTransactionSummaryAction(): Promise<
  ActionResponse<TransactionSummary>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const summary = await getTransactionSummaryByUserId(session.user.id)
    return { success: true, data: summary }
  } catch (error) {
    console.error("[GET_TRANSACTION_SUMMARY_ERROR]", error)
    return { success: false, error: "Gagal memuat ringkasan transaksi" }
  }
}

export async function getTransactionByIdAction(
  id: string
): Promise<ActionResponse<TransactionWithRelations>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const transaction = await getTransactionById(id, session.user.id)
    if (!transaction) {
      return { success: false, error: "Transaksi tidak ditemukan" }
    }

    return { success: true, data: transaction }
  } catch (error) {
    console.error("[GET_TRANSACTION_BY_ID_ERROR]", error)
    return { success: false, error: "Gagal mengambil data transaksi" }
  }
}

export async function createTransactionAction(
  input: unknown | FormData
): Promise<ActionResponse<Transaction>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = createTransactionSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi formulir gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await createTransactionWithBalanceUpdate(
      session.user.id,
      parsed.data
    )

    revalidatePath("/transactions")
    revalidatePath("/wallets")
    revalidatePath("/categories")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Transaksi berhasil dicatat dan saldo dompet diperbarui",
      data: created,
    }
  } catch (error) {
    console.error("[CREATE_TRANSACTION_ERROR]", error)
    return { success: false, error: "Gagal mencatat transaksi" }
  }
}

export async function updateTransactionAction(
  input: unknown | FormData
): Promise<ActionResponse<Transaction>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = updateTransactionSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi formulir gagal",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const updated = await updateTransactionWithBalanceUpdate(
      session.user.id,
      parsed.data
    )

    if (!updated) {
      return {
        success: false,
        error: "Transaksi tidak ditemukan atau gagal diperbarui",
      }
    }

    revalidatePath("/transactions")
    revalidatePath(`/transactions/${parsed.data.id}`)
    revalidatePath("/wallets")
    revalidatePath("/categories")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Transaksi berhasil diperbarui dan saldo dompet disesuaikan",
      data: updated,
    }
  } catch (error) {
    console.error("[UPDATE_TRANSACTION_ERROR]", error)
    return { success: false, error: "Gagal memperbarui transaksi" }
  }
}

export async function deleteTransactionAction(
  input: unknown
): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = typeof input === "string" ? { id: input } : input
    const parsed = deleteTransactionSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: "ID transaksi tidak valid" }
    }

    const success = await deleteTransactionWithBalanceRollback(
      parsed.data.id,
      session.user.id
    )

    if (!success) {
      return {
        success: false,
        error: "Transaksi tidak ditemukan atau gagal dihapus",
      }
    }

    revalidatePath("/transactions")
    revalidatePath("/wallets")
    revalidatePath("/categories")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Transaksi berhasil dihapus dan saldo dompet telah dikembalikan",
    }
  } catch (error) {
    console.error("[DELETE_TRANSACTION_ERROR]", error)
    return { success: false, error: "Gagal menghapus transaksi" }
  }
}
