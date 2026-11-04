import type { Metadata, Viewport } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { GlobalConfirmDialog } from "@/components/global-confirm-dialog"

// --- KONFIGURASI METADATA SMART BUDGET ---
const appName = process.env.NEXT_PUBLIC_APP_NAME || "SmartBudget"
const appDescription =
  "Aplikasi manajemen keuangan pribadi, pemantauan anggaran kategori, daftar belanja pintar, dan analisis arus kas modern."
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "klinik",
    "dokter",
    "praktik mandiri",
    "dr. Indra Addinar",
    "kesehatan",
    "rekam medis elektronik",
    "RME",
    "reservasi pasien",
  ],
  authors: [{ name: "Akasanastark", url: "https://akasanastark.com" }],
  creator: "Akasanastark - Future",
  publisher: "Akasanastark",
  openGraph: {
    title: appName,
    description: appDescription,
    url: appUrl,
    siteName: appName,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Biarkan jika Anda menggunakan Google Search Console untuk verifikasi domain
    google: "gWVL7_cj3XcS3pa3A97DaibKSCWjjq-rSlwZ-FZPehk",
  },
  alternates: {
    canonical: "/",
  },
}

// --- KONFIGURASI VIEWPORT (Kekinian & Mobile Responsive) ---
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom-in otomatis saat tap input di iOS/Mobile
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id" // Mengubah ke bahasa Indonesia
      suppressHydrationWarning
      className={cn(
        "min-h-screen scroll-smooth bg-background text-foreground antialiased"
      )}
    >
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Konten Utama Aplikasi */}
          <main className="flex flex-1 flex-col">{children}</main>

          {/* Global Components */}
          <Toaster richColors position="top-right" closeButton theme="system" />
          <GlobalConfirmDialog />
        </ThemeProvider>
      </body>
    </html>
  )
}
