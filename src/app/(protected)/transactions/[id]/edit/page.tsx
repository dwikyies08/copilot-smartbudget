import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon } from "@hugeicons/core-free-icons"

import { getTransactionByIdAction } from "@/app/actions/transaction.actions"
import { fetchWalletsAction } from "@/app/actions/wallet.actions"
import { fetchCategoriesAction } from "@/app/actions/category.actions"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UpdateTransactionForm } from "./_components/update-transaction-form"

type EditTransactionPageProps = {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: "Edit Transaksi | Smart Budget",
  description: "Perbarui detail transaksi pemasukan atau pengeluaran.",
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params

  const [txRes, walletsRes, categoriesRes] = await Promise.all([
    getTransactionByIdAction(id),
    fetchWalletsAction(),
    fetchCategoriesAction(),
  ])

  if (!txRes.success || !txRes.data) {
    notFound()
  }

  const tx = txRes.data
  const wallets = walletsRes.data?.wallets ?? []
  const categories = categoriesRes.data ?? []

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Edit01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Transaksi
            </h1>
            <p className="text-sm text-muted-foreground">
              Perbarui catatan mutasi:{" "}
              <span className="font-mono font-medium">
                {tx.description || tx.id}
              </span>
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Edit Data Transaksi</CardTitle>
          <CardDescription>
            Ubah detail nominal, rekening dompet, kategori, atau tanggal transaksi.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTransactionForm
            wallets={wallets}
            categories={categories}
            initialValues={{
              id: tx.id,
              walletId: tx.walletId,
              categoryId: tx.categoryId ?? null,
              amount: tx.amount,
              type: tx.type,
              description: tx.description ?? "",
              referenceCode: tx.referenceCode ?? "",
              status: tx.status ?? "completed",
              source: tx.source ?? "manual",
              transactionDate: tx.transactionDate,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

