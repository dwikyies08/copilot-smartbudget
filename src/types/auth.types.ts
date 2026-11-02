import type { User } from "@/types"

export type AuthUserSession = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type LoginCredentialsDTO = {
  email: string
  password: string
}

export type RegisterCredentialsDTO = {
  name: string
  email: string
  password: string
}

export type AuthResponse = {
  user?: Partial<User>
  redirectTo?: string
}

