"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import {
  getAllPemeriksaan,
  updatePemeriksaan,
  getPemeriksaanById,
  createPendaftaran,
  getPendaftaranById,
  softDeletePemeriksaanDanRelasi,
  getPemeriksaanPaginated,
  getLastIdPemeriksaan,
  createPemeriksaanDenganBypass,
  getRiwayatObatByNoPasien,
  getRiwayatObatByNoPasienPicker,
  getSaranKeluhanService,
  getSaranDiagnosaService,
} from "@/services/pemeriksaan.service"
import { formatNoPendaftaran } from "@/lib/helper"
import type { InsertPemeriksaan, InsertPendaftaran } from "@/lib/schema"

export type GetPemeriksaanListParams = {
  pageIndex?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  from?: string // Tambahkan ini
  to?: string // Tambahkan ini
}

/**
 * MENGAMBIL SEMUA DATA PEMERIKSAAN (RIWAYAT RME)
 */
export async function fetchPemeriksaanAction() {
  try {
    const data = await getAllPemeriksaan()
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching pemeriksaan:", error)
    return {
      success: false,
      error: "Gagal mengambil riwayat pemeriksaan dari server.",
    }
  }
}

export async function fetchSaranResep(noPasien: string) {
  try {
    if (!noPasien) return []

    // Memanggil service Drizzle yang sudah Anda buat
    const riwayat = await getRiwayatObatByNoPasienPicker(noPasien)
    return riwayat
  } catch (error) {
    console.error("Gagal mengambil saran resep:", error)
    return []
  }
}

/**
 * MENGAMBIL DETAIL PEMERIKSAAN SPESIFIK
 */
export async function fetchPemeriksaanByIdAction(id: number) {
  try {
    const data = await getPemeriksaanById(id)
    if (!data)
      return { success: false, error: "Data pemeriksaan tidak ditemukan." }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching detail pemeriksaan:", error)
    return { success: false, error: "Gagal mengambil detail pemeriksaan." }
  }
}

/**
 * MENYIMPAN DATA PEMERIKSAAN BARU (REKAM MEDIS)
 * Dipanggil oleh dokter setelah selesai memeriksa pasien
 */
export async function addPemeriksaanAction(
  dataPemeriksaan: InsertPemeriksaan,
  dataBypass?: InsertPendaftaran
) {
  try {
    if (!dataPemeriksaan.tanggal) {
      dataPemeriksaan.tanggal = new Date()
    }

    // Panggil service yang berisi db.transaction
    await createPemeriksaanDenganBypass(dataPemeriksaan, dataBypass)

    // Refresh cache
    revalidatePath("/pemeriksaan")
    revalidatePath("/pendaftaran")
    revalidatePath("/dashboard")
    revalidatePath("/pasien/[id]")

    return { success: "Data hasil pemeriksaan berhasil disimpan ke RME!" }
  } catch (error) {
    console.error("Error creating pemeriksaan:", error)
    return {
      error:
        "Gagal menyimpan data pemeriksaan. Periksa kembali kelengkapan form.",
    }
  }
}

/**
 * MENDAFTARKAN PASIEN KE ANTREAN (PENDAFTARAN)
 * Dipanggil oleh petugas pendaftaran/front-desk
 */
export async function addPendaftaranAction(data: InsertPendaftaran) {
  try {
    if (!data.Tgl_Daftar) {
      data.Tgl_Daftar = new Date()
    }

    await createPendaftaran(data)

    // Refresh cache tabel antrean di dashboard
    revalidatePath("/pendaftaran")
    revalidatePath("/dashboard")

    return { success: "Pasien berhasil didaftarkan ke dalam antrean!" }
  } catch (error) {
    console.error("Error creating pendaftaran:", error)
    return { error: "Gagal mendaftarkan pasien ke antrean." }
  }
}

/**
 * MENGAMBIL DATA PENDAFTARAN BERDASARKAN NOMOR
 */
export async function fetchPendaftaranByIdAction(id_pendaftaran: number) {
  try {
    const data = await getPendaftaranById(id_pendaftaran)
    if (!data)
      return { success: false, error: "Data pendaftaran tidak ditemukan." }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching pendaftaran:", error)
    return { success: false, error: "Gagal mengambil data pendaftaran." }
  }
}

export async function softDeletePemeriksaanAction(id: number) {
  try {
    // 1. Validasi input
    if (!id) {
      return { success: false, error: "ID pemeriksaan tidak valid" }
    }

    // 2. Eksekusi query soft delete
    const result = await softDeletePemeriksaanDanRelasi(id)

    // 3. Cek apakah data berhasil diupdate
    if (!result) {
      return { success: false, error: "Data pemeriksaan tidak ditemukan" }
    }

    // 4. Revalidasi cache halaman agar UI otomatis ter-update
    // Sesuaikan "/pemeriksaan" dengan route halaman tabel Anda
    revalidatePath("/pemeriksaan")
    revalidatePath("/pendaftaran")
    return {
      success: true,
      message: "Data berhasil dihapus",
      data: result[0],
    }
  } catch (error) {
    console.error("Error pada softDeletePemeriksaanAction:", error)
    return {
      success: false,
      error: "Terjadi kesalahan internal server saat menghapus data",
    }
  }
}

/**
 * Server Action untuk mengambil data pemeriksaan dengan pagination, filter, dan sorting.
 * Ini yang dipanggil oleh Server Component (page.tsx)
 */
export async function getPemeriksaanListAction(
  params: GetPemeriksaanListParams
) {
  try {
    // Memanggil fungsi dari layer service/database dengan parameter lengkap
    const result = await getPemeriksaanPaginated({
      pageIndex: params.pageIndex ?? 0,
      pageSize: params.pageSize ?? 10,
      search: params.search ?? "",
      sortBy: params.sortBy ?? "tanggal",
      sortOrder: params.sortOrder ?? "desc",
      // Teruskan parameter tanggal jika ada
      from: params.from,
      to: params.to,
    })

    return result
  } catch (error) {
    console.error("[PEMERIKSAAN_GET_ACTION_ERROR]", error)

    return {
      rows: [],
      rowCount: 0,
      pageCount: 0,
      error: "Gagal mengambil data pemeriksaan",
    }
  }
}

export async function getNextNoPemeriksaanAction() {
  try {
    const lastId = await getLastIdPemeriksaan()
    const nextId = lastId + 1
    return formatNoPendaftaran(nextId)
  } catch (error) {
    console.error("Error generating RM:", error)
    return "" // Atau handle error sesuai kebutuhan
  }
}

/**
 * MEMPERBARUI DATA PEMERIKSAAN
 * Dipanggil dari halaman Edit Pemeriksaan
 */
export async function updatePemeriksaanAction(
  data: Partial<InsertPemeriksaan> & { id: number }
) {
  try {
    // 1. Validasi keberadaan ID
    if (!data.id) {
      return { error: "ID Pemeriksaan tidak ditemukan atau tidak valid." }
    }

    // 2. Pisahkan ID dari sisa payload yang akan diupdate
    const { id, ...updatePayload } = data

    // 3. Panggil service untuk update ke database
    await updatePemeriksaan(id, updatePayload)

    // 4. Refresh cache halaman agar perubahan langsung terlihat di tabel
    revalidatePath("/pemeriksaan")
    revalidatePath("/dashboard")

    // Jika Anda memiliki halaman detail pemeriksaan spesifik:
    // revalidatePath(`/pemeriksaan/${id}`)

    return { success: "Data pemeriksaan berhasil diperbarui!" }
  } catch (error) {
    console.error("Error updating pemeriksaan:", error)
    return {
      error: "Gagal memperbarui data pemeriksaan. Periksa kembali form Anda.",
    }
  }
}

export async function getRiwayatObatAction(noPasien: string) {
  if (!noPasien) {
    return { error: "Nomor pasien tidak valid." }
  }

  try {
    const riwayat = await getRiwayatObatByNoPasien(noPasien)

    return {
      success: true,
      data: riwayat,
    }
  } catch (error) {
    console.error("[GET_RIWAYAT_OBAT_ERROR]", error)
    return {
      error: "Terjadi kesalahan saat mengambil riwayat obat.",
    }
  }
}

export async function getSaranKeluhanAction(noPasien?: string) {
  try {
    // Panggil service
    const data = await getSaranKeluhanService(noPasien)
    return data
  } catch (error) {
    console.error("[ACTION ERROR] Gagal memuat saran keluhan:", error)
    // Kembalikan array kosong agar UI tidak crash
    return []
  }
}

export async function getSaranDiagnosaAction(noPasien?: string) {
  try {
    const data = await getSaranDiagnosaService(noPasien)
    return data
  } catch (error) {
    console.error("[ACTION ERROR] Gagal memuat saran diagnosa:", error)
    return []
  }
}
