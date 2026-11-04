"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import {
  getUserByEmail,
  createUser,
  updateUser,
} from "@/services/user.service"
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

  const email = parsed.data.email.trim().toLowerCase()
  const { password } = parsed.data

  try {
    // Memanggil signIn dari konfigurasi auth.ts
    await signIn("credentials", {
      email,
      password,
      redirect: false, // Set false agar bisa menangani error di server action
    })
  } catch (error) {
    if (error instanceof AuthError) {
      const causeMessage = (error.cause?.err as Error | undefined)?.message
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: causeMessage || "Email atau password tidak valid!",
          }
        case "CallbackRouteError":
          return {
            success: false,
            error: causeMessage || "Email atau password tidak valid!",
          }
        default:
          return {
            success: false,
            error: causeMessage || "Terjadi kesalahan saat login.",
          }
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

// --- ACTION REGISTRASI (Mendaftar / Sinkronisasi Password Berdasarkan Email) ---
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

  const name = parsed.data.name.trim()
  const email = parsed.data.email.trim().toLowerCase()
  const { password } = parsed.data

  // 1. Cek apakah email sudah terdaftar
  const existingUser = await getUserByEmail(email)

  // 2. Hash password sebelum disimpan ke database
  const hashedPassword = await bcrypt.hash(password, 10)

  if (existingUser) {
    // Jika akun sudah ada melalui Google OAuth (belum memiliki password),
    // sinkronkan password baru ke akun yang sudah ada tersebut
    if (!existingUser.password) {
      const syncedUser = await updateUser(existingUser.id, {
        name: existingUser.name || name,
        password: hashedPassword,
      })

      return {
        success: true,
        message:
          "Password berhasil disinkronkan dengan akun Google Anda! Silakan login.",
        data: {
          id: syncedUser?.id ?? existingUser.id,
          email: syncedUser?.email ?? existingUser.email,
        },
      }
    }

    return { success: false, error: "Email sudah digunakan!" }
  }

  // 3. Simpan user baru ke database menggunakan user service
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
