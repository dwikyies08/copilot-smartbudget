import NextAuth, { type DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/schema"
import {
  getUserByEmail,
  syncUserByEmail,
  updateUser,
} from "@/services/user.service"
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
  // Gunakan strategi JWT agar kompatibel dengan Google OAuth maupun Credentials
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      // Izinkan akun Google menautkan (sync) secara otomatis ke akun yang memiliki email sama
      allowDangerousEmailAccountLinking: true,
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

        const email = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        // Ambil data user dari database berdasarkan email (case-insensitive)
        let user = await getUserByEmail(email)

        if (!user) {
          throw new Error("Email tidak ditemukan")
        }

        // Jika akun sebelumnya dibuat via Google OAuth (belum punya password),
        // sinkronkan password baru ke akun dengan email yang cocok tersebut
        if (!user.password) {
          const hashedPassword = await bcrypt.hash(password, 10)
          const updated = await updateUser(user.id, {
            password: hashedPassword,
          })
          if (updated) {
            user = updated
          }
        } else {
          // Verifikasi password dengan bcrypt
          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (!passwordsMatch) {
            throw new Error("Password salah")
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  events: {
    async linkAccount({ user }) {
      if (user.id) {
        await updateUser(user.id, {
          emailVerified: new Date(),
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = (user.email || (profile?.email as string | undefined))
          ?.trim()
          .toLowerCase()

        if (!email) {
          return false
        }

        user.email = email

        // Sinkronkan profil user jika email sudah terdaftar sebelumnya (misal via Credentials)
        const syncedUser = await syncUserByEmail({
          email,
          name: user.name || (profile?.name as string | undefined),
          image: user.image || (profile?.picture as string | undefined),
        })

        if (syncedUser) {
          user.id = syncedUser.id
          user.role = syncedUser.role
          user.name = syncedUser.name
          user.image = syncedUser.image
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "user"
        token.email = user.email?.trim().toLowerCase() || token.email
        token.name = user.name || token.name
        token.picture = user.image || token.picture
      }

      // Pastikan token selalu tersinkronisasi dengan data user di database berdasarkan email yang cocok
      const lookupEmail = (user?.email || token.email) as string | undefined
      if (lookupEmail && (user || !token.id || !token.role)) {
        const dbUser = await getUserByEmail(lookupEmail)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role || "user"
          token.email = dbUser.email
          token.name = dbUser.name || token.name
          token.picture = dbUser.image || token.picture
        }
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name
        token.picture = session.user.image ?? token.picture
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || "user"
        if (token.email) session.user.email = token.email as string
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
