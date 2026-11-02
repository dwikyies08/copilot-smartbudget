"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  createWalletSchema,
  updateWalletSchema,
  deleteWalletSchema,
  formatZodErrors,
} from "@/validations"
import {
  getWalletsByUserId,
  getWalletsPaginated,
  getWalletById,
  getTotalBalanceByUserId,
  createWallet,
  updateWallet,
  deleteWallet,
} from "@/services/wallet.service"
import type { ActionResponse, PaginatedResult, Wallet, WalletSummary } from "@/types"

export async function getWalletsListAction(params: {
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}): Promise<PaginatedResult<Wallet>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { rows: [], rowCount: 0, pageCount: 0 }
    }

    return await getWalletsPaginated({
      userId: session.user.id,
      ...params,
    })
  } catch (error) {
    console.error("[GET_WALLETS_LIST_ERROR]", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

export async function fetchWalletsAction(): Promise<ActionResponse<WalletSummary>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const [wallets, totalBalance] = await Promise.all([
      getWalletsByUserId(session.user.id),
      getTotalBalanceByUserId(session.user.id),
    ])

    return {
      success: true,
      data: {
        wallets,
        totalBalance,
        walletCount: wallets.length,
      },
    }
  } catch (error) {
    console.error("[FETCH_WALLETS_ERROR]", error)
    return { success: false, error: "Gagal memuat data dompet" }
  }
}

export async function getWalletByIdAction(
  id: string
): Promise<ActionResponse<Wallet>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const wallet = await getWalletById(id, session.user.id)
    if (!wallet) {
      return { success: false, error: "Dompet tidak ditemukan" }
    }

    return {
      success: true,
      data: wallet,
    }
  } catch (error) {
    console.error("[GET_WALLET_BY_ID_ERROR]", error)
    return { success: false, error: "Gagal memuat detail dompet" }
  }
}

export async function createWalletAction(
  input: unknown | FormData
): Promise<ActionResponse<Wallet>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = createWalletSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi gagal. Periksa kembali input Anda.",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await createWallet(session.user.id, parsed.data)

    revalidatePath("/wallets")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Dompet berhasil dibuat",
      data: created,
    }
  } catch (error) {
    console.error("[CREATE_WALLET_ERROR]", error)
    return { success: false, error: "Gagal membuat dompet baru" }
  }
}

export async function updateWalletAction(
  input: unknown | FormData
): Promise<ActionResponse<Wallet>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : input

    const parsed = updateWalletSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi gagal. Periksa kembali input Anda.",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const updated = await updateWallet(session.user.id, parsed.data)
    if (!updated) {
      return {
        success: false,
        error: "Dompet tidak ditemukan atau Anda tidak memiliki akses",
      }
    }

    revalidatePath("/wallets")
    revalidatePath(`/wallets/${parsed.data.id}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Dompet berhasil diperbarui",
      data: updated,
    }
  } catch (error) {
    console.error("[UPDATE_WALLET_ERROR]", error)
    return { success: false, error: "Gagal memperbarui dompet" }
  }
}

export async function deleteWalletAction(
  input: unknown | FormData
): Promise<ActionResponse<Wallet>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData =
      typeof FormData !== "undefined" && input instanceof FormData
        ? Object.fromEntries(input.entries())
        : typeof input === "string"
        ? { id: input }
        : input

    const parsed = deleteWalletSchema.safeParse(rawData)
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi gagal. ID dompet tidak valid.",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const deleted = await deleteWallet(parsed.data.id, session.user.id)
    if (!deleted) {
      return {
        success: false,
        error: "Dompet tidak ditemukan atau Anda tidak memiliki akses",
      }
    }

    revalidatePath("/wallets")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Dompet berhasil dihapus",
      data: deleted,
    }
  } catch (error) {
    console.error("[DELETE_WALLET_ERROR]", error)
    return { success: false, error: "Gagal menghapus dompet" }
  }
}
