import { RegisterForm } from "@/components/auth/register-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register",
  description: "Buat akun RME baru Anda.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
