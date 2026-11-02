/**
 * Helper untuk konversi tanggal antara Turso (Integer/Unix Timestamp)
 * dan JavaScript (Date Object / ISO String)
 */

export const dateHelper = {
  /**
   * Mengubah timestamp (detik) dari database menjadi objek Date JavaScript
   * @param timestamp - Nilai integer dari database (detik)
   */
  toJsDate: (value: any): Date | null => {
    if (!value) return null

    // Jika data berasal dari DB (integer/detik), konversi ke angka
    if (typeof value === "number") {
      return new Date(value)
    }

    // Jika data sudah dalam format string/Date (misal dari input/API), langsung buat Date
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  },

  /**
   * Mengubah Date object atau string tanggal menjadi timestamp (detik) untuk database
   * @param date - Tanggal yang akan disimpan
   */
  toDbTimestamp: (date: Date | string | null | undefined): number => {
    if (!date) return 0
    const d = new Date(date)
    return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime())
  },

  /**
   * Mengubah timestamp ke format string untuk tampilan (misal: 07/06/2026)
   */
  toDisplay: (timestamp: number | null | undefined): string => {
    const date = dateHelper.toJsDate(timestamp)
    return date
      ? date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-"
  },

  /**
   * Mengubah timestamp ke format ISO untuk input HTML date (YYYY-MM-DD)
   */
  toIsoInput: (timestamp: number | null | undefined): string => {
    const date = dateHelper.toJsDate(timestamp)
    if (!date) return ""
    return date.toISOString().split("T")[0]
  },
}

export const toIsoString = (val: number | null | undefined) => {
  if (!val || val === 0) return ""
  const d = new Date(val * 1000) // Konversi detik ke milidetik
  return isNaN(d.getTime()) ? "" : d.toISOString()
}

/**
 * Menghasilkan nomor RM (Rekam Medis) unik
 * Format: RM-YYMMDD-XXXX (Contoh: RM-260605-0001)
 */
export function formatNoPasien(nextId: number): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")

  // Format: RM-260608-0005 (menggunakan ID sebagai urutan)
  const sequence = nextId.toString().padStart(4, "0")
  return `RM-${year}${month}${day}-${sequence}`
}

/**
 * Menghasilkan nomor Pemeriksaan unik
 * Format: PM-YYMMDD-XXXX (Contoh: PM-260605-0001)
 */
export function formatNoPendaftaran(nextId: number): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")

  // Menggunakan timestamp milidetik terakhir untuk keunikan tinggi
  const sequence = nextId.toString().padStart(4, "0")

  return `PM-${year}${month}${day}-${sequence}`
}
