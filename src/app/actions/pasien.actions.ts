"use server"

import { revalidatePath } from "next/cache"
import {
  getAllPasien,
  getPasienById,
  getPasienPaginated,
  createPasien,
  updatePasien,
  softDeletePasien,
  getLastId,
} from "@/services/pasien.service"
import { pasien } from "@/lib/schema"
import { formatNoPasien } from "@/lib/helper"

// Mendapatkan tipe data insert langsung dari skema Drizzle
type InsertPasien = typeof pasien.$inferInsert

/**
 * MENGAMBIL SEMUA DATA PASIEN
 * Digunakan untuk menampilkan list di tabel data pasien
 */
export async function fetchPasienAction() {
  try {
    const data = await getAllPasien()
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching pasien:", error)
    return { success: false, error: "Gagal mengambil data pasien dari server." }
  }
}

/**
 * MENGAMBIL DETAIL SATU PASIEN
 */
export async function fetchPasienByIdAction(noPasien: string) {
  try {
    const data = await getPasienById(noPasien)
    if (!data) return { success: false, error: "Data pasien tidak ditemukan." }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching detail pasien:", error)
    return { success: false, error: "Gagal mengambil detail pasien." }
  }
}

/**
 * MENAMBAHKAN PASIEN BARU
 * Menerima objek data yang sudah diparsing dari form (misal via React Hook Form)
 */
export async function addPasienAction(data: InsertPasien) {
  try {
    // Pastikan tanggal registrasi terisi jika tidak dikirim dari form
    if (!data.Tgl_Reg) {
      data.Tgl_Reg = new Date()
    }

    await createPasien(data)

    // Refresh cache halaman agar tabel pasien langsung terupdate
    revalidatePath("/pasien")
    revalidatePath("/dashboard")

    return { success: "Data pasien berhasil didaftarkan!" }
  } catch (error) {
    console.error("Error creating pasien:", error)
    return {
      error:
        "Gagal mendaftarkan pasien. Pastikan No. Pasien (RM) tidak duplikat.",
    }
  }
}

/**
 * MENGUBAH DATA PASIEN
 */
export async function editPasienAction(
  noPasien: string,
  data: Partial<InsertPasien>
) {
  try {
    if (!noPasien) return { error: "Nomor rekam medis (RM) tidak valid." }

    await updatePasien(noPasien, data)

    // Refresh cache halaman
    revalidatePath("/pasien")
    revalidatePath(`/pasien/${noPasien}`)

    return { ok: true, message: "Data pasien berhasil diperbarui!" }
  } catch (error) {
    console.error("Error updating pasien:", error)
    return { error: "Gagal memperbarui data rekam medis pasien." }
  }
}

/**
 * MENGHAPUS PASIEN (SOFT DELETE)
 * Data tidak benar-benar hilang dari database, hanya ditandai `deleted_at`
 */
export async function removePasienAction(noPasien: string) {
  try {
    await softDeletePasien(noPasien)

    // Refresh cache halaman
    revalidatePath("/pasien")

    return { success: "Data pasien berhasil dihapus (diarsipkan)!" }
  } catch (error) {
    console.error("Error deleting pasien:", error)
    return { error: "Gagal menghapus data pasien." }
  }
}

export async function getPasienListAction(params: {
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  try {
    const result = await getPasienPaginated(params)
    return result
  } catch (error) {
    console.error("Gagal mengambil data pasien:", error)
    return { rows: [], rowCount: 0, pageCount: 0 }
  }
}

/**
 * MENGAMBIL NOMOR RM BERIKUTNYA
 * Digunakan oleh form untuk mengisi field No_Pasien secara otomatis
 */
export async function getNextNoPasienAction() {
  try {
    const lastId = await getLastId()
    const nextId = lastId + 1
    return formatNoPasien(nextId)
  } catch (error) {
    console.error("Error generating RM:", error)
    return "" // Atau handle error sesuai kebutuhan
  }
}
