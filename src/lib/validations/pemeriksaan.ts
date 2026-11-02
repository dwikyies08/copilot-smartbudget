import * as z from "zod"

export const createPemeriksaanSchema = z.object({
  idPendaftaran: z.number(),
  NoPemeriksaan: z.string().min(1, "No Pemeriksaan wajib diisi"),
  Keluhan: z.string().min(1, "Keluhan wajib diisi"),
  Diagnosa: z.string().min(1, "Diagnosa wajib diisi"),

  // Ubah menjadi opsional (jika tidak ada di UI saat ini)
  Perawatan: z.string().optional(),
  Tindakan: z.string().optional(),
  Tanggal: z.string().optional(),

  // Ubah positive() menjadi min(0) atau nonnegative() agar default 0 lolos validasi
  BeratBadan: z.coerce.number().min(0, "Berat badan tidak boleh negatif"),
  TensiSistolik: z.coerce.number().positive("Tensi sistolik harus diisi"),
  TensiDiastolik: z.coerce.number().positive("Tensi diastolik harus diisi"),
  resep: z.string().optional(),
})
export const updatePemeriksaanSchema = z.object({
  id: z.number(),

  NoPemeriksaan: z.string().min(1, "Nomor Pemeriksaan tidak boleh kosong"),

  // Asumsi keluhan dan diagnosa wajib diisi
  Keluhan: z.string().min(1, "Keluhan wajib diisi"),
  Diagnosa: z.string().min(1, "Diagnosa wajib diisi"),

  // Kolom teks lainnya bisa dibuat opsional jika dokter belum/tidak mengisinya
  Perawatan: z.string().optional(),
  Tindakan: z.string().optional(),
  resep: z.string().optional(),

  // z.coerce.number() akan otomatis mengubah input string "60" menjadi angka 60
  BeratBadan: z.coerce.number().min(0, "Berat badan tidak boleh negatif"),
  TensiSistolik: z.coerce.number().positive("Tensi sistolik harus diisi"),
  TensiDiastolik: z.coerce.number().positive("Tensi diastolik harus diisi"),

  // Data opsional atau yang mungkin disembunyikan/tidak diedit di UI tapi ikut dikirim
  ID_Biaya: z.string().optional(),
  No_Daftar: z.string().optional(),
  idPendaftaran: z.number().optional(),
})
// Export type agar bisa digunakan di Form dan Actions
export type UpdatePemeriksaanSchema = z.infer<typeof updatePemeriksaanSchema>
export type CreatePemeriksaanSchema = z.infer<typeof createPemeriksaanSchema>
