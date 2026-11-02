import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon } from "@hugeicons/core-free-icons"

import { fetchWalletsAction } from "@/app/actions/wallet.actions"
import { fetchCategoriesAction } from "@/app/actions/category.actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreateTransactionForm } from "./_components/create-transaction-form"

export const metadata: Metadata = {
  title: "Catat Transaksi | Smart Budget",
  description: "Catat transaksi pemasukan atau pengeluaran baru ke dalam sistem.",
}

export default async function CreateTransactionPage() {
  const [walletsRes, categoriesRes] = await Promise.all([
    fetchWalletsAction(),
    fetchCategoriesAction(),
  ])

  const wallets = walletsRes.data?.wallets ?? []
  const categories = categoriesRes.data ?? []

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Catat Transaksi Baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambahkan catatan mutasi pemasukan atau pengeluaran keuangan Anda.
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Pencatatan Transaksi</CardTitle>
          <CardDescription>
            Lengkapi rincian nominal, rekening dompet, dan kategori anggaran.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateTransactionForm wallets={wallets} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}

