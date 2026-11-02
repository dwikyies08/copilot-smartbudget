import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { customAlphabet } from "nanoid"

// Membuat ID sepanjang 10 karakter menggunakan angka dan huruf besar
// Contoh hasil: "REG260609X7"
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5)

export function generateNoDaftar() {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "") // 260609
  const randomPart = nanoid()
  return `REG${datePart}${randomPart}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
