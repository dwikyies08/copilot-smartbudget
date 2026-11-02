import NextAuth, { type DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/schema"
import { getUserByEmail } from "@/services/user.service"
import bcrypt from "bcryptjs"

// === MODULE AUGMENTATION ===
// Memberi tahu TypeScript tentang properti 'role' dan 'id' custom kita
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
// ===========================

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Adaptor Drizzle untuk menghubungkan Next-Auth dengan Turso
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Gunakan strategi JWT karena kita menggunakan Credentials
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, // Izinkan akun Google menautkan ke email yang sudah ada
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Ambil data user dari database menggunakan service yang sudah dibuat
        const user = await getUserByEmail(email)

        if (!user) {
          throw new Error("Email tidak ditemukan")
        }

        if (!user.password) {
          throw new Error(
            "Akun ini mendaftar menggunakan Google. Silakan login dengan Google."
          )
        }

        // Verifikasi password dengan bcrypt
        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) {
          throw new Error("Password salah")
        }

        // Jika berhasil, kembalikan objek user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // Sekarang TypeScript tahu 'role' itu valid
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login", // Arahkan ke halaman custom login Anda
  },
})
