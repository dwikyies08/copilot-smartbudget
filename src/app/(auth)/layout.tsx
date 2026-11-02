import { Activity } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      {/* Logo Header */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-primary transition-opacity hover:opacity-90"
      >
        <div className="rounded-xl bg-primary/10 p-2">
          <Activity className="h-8 w-8" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          Akasanastark <span className="font-normal text-primary">Future</span>
        </span>
      </Link>

      {/* Form Container */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
