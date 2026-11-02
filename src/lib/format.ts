// lib/format.ts

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const compactIdrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
})

const dateFormatterID = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const dateTimeFormatterID = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

/**
 * Format angka menjadi mata uang Rupiah (contoh: "Rp 1.500.000")
 */
export function formatIDR(amount: number | null | undefined): string {
  return idrFormatter.format(amount ?? 0)
}

/**
 * Format angka menjadi Rupiah ringkas untuk chart/kartu kecil (contoh: "Rp 1,5 jt")
 */
export function formatCompactIDR(amount: number | null | undefined): string {
  return compactIdrFormatter.format(amount ?? 0)
}

/**
 * Format Date atau timestamp menjadi tanggal Indonesia (contoh: "21 Okt 2026")
 */
export function formatDateID(date: Date | number | string | null | undefined): string {
  if (!date) return "-"
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return "-"
  return dateFormatterID.format(parsed)
}

/**
 * Format Date atau timestamp menjadi tanggal & jam Indonesia (contoh: "21 Okt 2026, 17.30")
 */
export function formatDateTimeID(date: Date | number | string | null | undefined): string {
  if (!date) return "-"
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return "-"
  return dateTimeFormatterID.format(parsed)
}

/**
 * Hitung persentase pemakaian anggaran (0 - 100+) beserta status warnanya
 */
export function calculateBudgetUsage(spent: number, limit: number | null | undefined) {
  const safeLimit = limit ?? 0
  if (safeLimit <= 0) {
    return {
      percentage: 0,
      clampedPercentage: 0,
      remaining: 0,
      status: "no-limit" as const,
    }
  }

  const percentage = Math.round((spent / safeLimit) * 100)
  const clampedPercentage = Math.min(100, Math.max(0, percentage))
  const remaining = safeLimit - spent

  let status: "safe" | "warning" | "over" = "safe"
  if (percentage >= 100) {
    status = "over"
  } else if (percentage >= 80) {
    status = "warning"
  }

  return {
    percentage,
    clampedPercentage,
    remaining,
    status,
  }
}

