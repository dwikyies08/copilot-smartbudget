import { z } from "zod"

// ==========================================
// SCHEMA PASIEN
// ==========================================

export const createPasienSchema = z.object({
  No_Pasien: z.string().optional().default(""), // Dihapus min(1) karena akan di-generate
  Nama_Pasien: z
    .string()
    .trim()
    .min(1, "Nama pasien wajib diisi.")
    .max(50, "Nama pasien maksimal 50 karakter."),
  AlmPas: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi.")
    .max(50, "Alamat maksimal 50 karakter."),
  TelpPas: z.string().trim().optional(),
  nohp: z.string().trim().optional(),
  photo: z
    .string()
    .trim()
    .max(200, "URL foto terlalu panjang.")
    .optional()
    .default(""),
  TglLahirPas: z.coerce.date().optional(),
  keterangan: z.string().optional(),
  JenisKelPas: z.number().optional(),
})

export const updatePasienSchema = z.object({
  No_Pasien: z.string().min(1, "Nomor RM wajib disertakan untuk update."),
  Nama_Pasien: z
    .string()
    .trim()
    .min(1, "Nama pasien wajib diisi.")
    .max(50)
    .optional(),
  AlmPas: z.string().trim().min(1, "Alamat wajib diisi.").max(50).optional(),
  TelpPas: z.string().trim().max(20).optional(),
  nohp: z.string().trim().optional(),
  photo: z.string().trim().max(200).optional(),
  // Pastikan tetap menggunakan coerce.date()
  TglLahirPas: z.coerce.date().optional(),
  keterangan: z.string().optional(),
  JenisKelPas: z.number().optional(),
})

export type CreatePasienSchema = z.infer<typeof createPasienSchema>
export type UpdatePasienSchema = z.infer<typeof updatePasienSchema>

// ==========================================
// SCHEMA PEMERIKSAAN (REKAM MEDIS)
// ==========================================

export const createPemeriksaanSchema = z.object({
  NoPemeriksaan: z
    .string()
    .trim()
    .min(1, "Nomor Pemeriksaan wajib diisi.")
    .max(32, "Nomor Pemeriksaan maksimal 32 karakter."),
  No_Daftar: z
    .string()
    .trim()
    .min(1, "Nomor Pendaftaran wajib diisi.")
    .max(10, "Nomor Pendaftaran maksimal 10 karakter."),
  ID_Biaya: z
    .string()
    .trim()
    .min(1, "ID Biaya wajib diisi.")
    .max(5, "ID Biaya maksimal 5 karakter."),
  Keluhan: z
    .string()
    .trim()
    .min(1, "Keluhan pasien wajib diisi.")
    .max(225, "Keluhan maksimal 225 karakter."),
  Diagnosa: z
    .string()
    .trim()
    .min(1, "Diagnosa wajib diisi.")
    .max(225, "Diagnosa maksimal 225 karakter."),
  Perawatan: z
    .string()
    .trim()
    .min(1, "Data perawatan wajib diisi.")
    .max(225, "Data perawatan maksimal 225 karakter."),
  Tindakan: z
    .string()
    .trim()
    .min(1, "Data tindakan medis wajib diisi.")
    .max(225, "Data tindakan maksimal 225 karakter."),
  resep: z.string().trim().optional(),
})

export const updatePemeriksaanSchema = createPemeriksaanSchema
  .partial()
  .extend({
    id: z.coerce.number().min(1, "ID Pemeriksaan tidak valid."),
  })

export type CreatePemeriksaanSchema = z.infer<typeof createPemeriksaanSchema>
export type UpdatePemeriksaanSchema = z.infer<typeof updatePemeriksaanSchema>
