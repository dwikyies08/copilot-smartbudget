import { LoginForm } from "@/components/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke akun RME Anda.",
}

export default function LoginPage() {
  return <LoginForm />
}
