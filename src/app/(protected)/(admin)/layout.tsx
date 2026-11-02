import { auth } from "@/auth" // Sesuaikan path auth Anda
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }) {
  const session = await auth()

  // 1. Cek apakah user sudah login
  if (!session) {
    redirect("/api/auth/signin")
  }

  // 2. Cek apakah role user diizinkan
  const allowedRoles = ["admin", "nakes", "dokter"]
  if (session?.user?.role !== "admin") {
    // Jika tidak punya akses, lempar ke halaman unauthorized atau dashboard utama
    redirect("/")
  }

  return (
    <div className="admin-container">
      {/* Anda bisa menambahkan Sidebar atau Header Admin di sini */}
      <main>{children}</main>
    </div>
  )
}
