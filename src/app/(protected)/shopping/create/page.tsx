import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { CreateTemplateForm } from "./_components/create-template-form"

export default function CreateShoppingTemplatePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Buat Template Belanja
            </h1>
            <p className="text-sm text-muted-foreground">
              Susun daftar barang belanjaan rutin beserta estimasi harganya
            </p>
          </div>
        </div>

        <Link href="/shopping" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Form Template Belanja</CardTitle>
          <CardDescription>
            Pastikan setiap barang memiliki perkiraan harga satuan yang sesuai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTemplateForm />
        </CardContent>
      </Card>
    </div>
  )
}

