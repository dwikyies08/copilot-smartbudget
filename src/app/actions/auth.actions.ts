"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { getUserByEmail, createUser } from "@/services/user.service"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { loginSchema, registerSchema, formatZodErrors } from "@/validations"
import type { ActionResponse } from "@/types"

// --- ACTION LOGIN ---
export async function loginAction(
  formData: FormData
): Promise<ActionResponse<{ email: string }>> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    const fieldErrors = formatZodErrors(parsed.error)
    const firstErrorMessage =
      Object.values(fieldErrors)[0]?.[0] || "Data login tidak valid"
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    }
  }

  const { email, password } = parsed.data

  try {
    // Memanggil signIn dari konfigurasi auth.ts
    await signIn("credentials", {
      email,
      password,
      redirect: false, // Set false agar bisa menangani error di server action
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Kredensial tidak valid!" }
        default:
          return { success: false, error: "Terjadi kesalahan saat login." }
      }
    }
    throw error
  }

  // Jika berhasil, redirect ke dashboard
  redirect("/dashboard")
}

// --- ACTION LOGIN GOOGLE ---
export async function loginWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" })
}

// --- ACTION LOGOUT ---
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

// --- ACTION REGISTRASI (Mendaftar dengan Password) ---
export async function registerAction(
  formData: FormData
): Promise<ActionResponse<{ id: string; email: string }>> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = registerSchema.safeParse(rawData)
  if (!parsed.success) {
    const fieldErrors = formatZodErrors(parsed.error)
    const firstErrorMessage =
      Object.values(fieldErrors)[0]?.[0] || "Data registrasi tidak valid"
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    }
  }

  const { name, email, password } = parsed.data

  // 1. Cek apakah email sudah terdaftar
  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    return { success: false, error: "Email sudah digunakan!" }
  }

  // 2. Hash password sebelum disimpan ke database
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Simpan ke database menggunakan user service
  const newUser = await createUser({
    name,
    email,
    password: hashedPassword,
  })

  return {
    success: true,
    message: "Registrasi berhasil! Silakan login.",
    data: {
      id: newUser.id,
      email: newUser.email,
    },
  }
}
