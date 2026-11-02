import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreateWalletForm } from "./_components/create-wallet-form"

export const metadata: Metadata = {
  title: "Tambah Dompet | Smart Budget",
  description: "Daftarkan dompet atau rekening baru ke dalam sistem Smart Budget.",
}

export default function CreateWalletPage() {
  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Wallet01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Tambah Dompet Baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Tambahkan rekening bank, e-wallet, atau kas tunai ke akun Anda.
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Pendaftaran Dompet</CardTitle>
          <CardDescription>
            Lengkapi formulir di bawah ini untuk mulai melacak saldo pada dompet baru.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateWalletForm />
        </CardContent>
      </Card>
    </div>
  )
}

