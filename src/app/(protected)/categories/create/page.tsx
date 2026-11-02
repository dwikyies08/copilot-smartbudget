import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreateCategoryForm } from "./_components/create-category-form"

export const metadata: Metadata = {
  title: "Tambah Kategori | Smart Budget",
  description: "Buat kategori pemasukan atau pengeluaran baru beserta batas anggaran.",
}

export default function CreateCategoryPage() {
  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Folder01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Tambah Kategori Baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambahkan kategori transaksi dan atur plafon anggaran bulanan.
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Pendaftaran Kategori</CardTitle>
          <CardDescription>
            Lengkapi nama kategori, tipe aliran kas, dan target limit anggaran.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateCategoryForm />
        </CardContent>
      </Card>
    </div>
  )
}

