import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon } from "@hugeicons/core-free-icons"

import { getWalletByIdAction } from "@/app/actions/wallet.actions"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UpdateWalletForm } from "./_components/update-wallet-form"

type EditWalletPageProps = {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: "Edit Dompet | Smart Budget",
  description: "Perbarui informasi nama rekening, mata uang, dan saldo dompet.",
}

export default async function EditWalletPage({ params }: EditWalletPageProps) {
  const { id } = await params

  const result = await getWalletByIdAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const wallet = result.data

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Edit01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Dompet
            </h1>
            <p className="text-sm text-muted-foreground">
              Perbarui data rekening:{" "}
              <span className="font-mono font-medium">{wallet.name}</span>
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Edit Data Dompet</CardTitle>
          <CardDescription>
            Ubah detail nama rekening, mata uang, dan nominal saldo.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateWalletForm
            initialValues={{
              id: wallet.id,
              name: wallet.name,
              balance: wallet.balance ?? 0,
              currency: wallet.currency ?? "IDR",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

