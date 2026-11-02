// changed for learning neovim with lazyvim
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Stethoscope, ShieldCheck, Zap } from "lucide-react"
import { useRouter } from "next/navigation" // Menggunakan router untuk navigasi

export default function LandingPage() {
  const router = useRouter() // Hook untuk navigasi

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-emerald-400">RME NEXT</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/login")}
            className="transition hover:text-emerald-400"
          >
            Login
          </button>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-6 text-6xl font-extrabold md:text-8xl">
            RME <span className="text-emerald-400">NEXT</span>
          </h2>
          <p className="mb-10 max-w-2xl text-xl text-neutral-400">
            Platform Rekam Medis Elektronik canggih untuk Dr. Indra Addinar.
            Dokumentasi klinis yang lebih cepat, aman, dan presisi.
          </p>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => router.push("/register")}
            >
              Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-700 text-white"
              onClick={() => router.push("/login")}
            >
              Masuk ke Portal
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 grid max-w-5xl gap-8 md:grid-cols-3"
        >
          <FeatureCard
            icon={<Stethoscope />}
            title="Presisi Neurologi"
            desc="Template pemeriksaan khusus untuk spesialis syaraf."
          />
          <FeatureCard
            icon={<ShieldCheck />}
            title="SatuSehat Ready"
            desc="Kepatuhan penuh standar Kemenkes RI."
          />
          <FeatureCard
            icon={<Zap />}
            title="Dokumentasi Cepat"
            desc="Efisienkan waktu input dengan AI-Assistant."
          />
        </motion.div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8 transition-all hover:border-emerald-500">
      <div className="mb-4 text-emerald-400">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-neutral-500">{desc}</p>
    </div>
  )
}
