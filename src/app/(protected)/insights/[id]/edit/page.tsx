import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPredictionByIdAction } from "@/app/actions/prediction.actions"

import { UpdatePredictionForm } from "./_components/update-prediction-form"

export default async function EditPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getPredictionByIdAction(id)
  if (!res.success || !res.data) notFound()

  const prediction = res.data

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={SparklesIcon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Edit Prediksi Produk
            </h1>
            <p className="text-sm text-muted-foreground">
              Perbarui proyeksi harga{" "}
              <span className="font-medium text-foreground">
                {prediction.productName}
              </span>
            </p>
          </div>
        </div>

        <Link href="/insights" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Prediksi</CardTitle>
          <CardDescription>
            Perubahan akan langsung memperbarui perhitungan inflasi di tabel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdatePredictionForm
            initialValues={{
              id: prediction.id,
              productName: prediction.productName,
              averagePrice: prediction.averagePrice ?? 0,
              predictedNextPrice: prediction.predictedNextPrice ?? 0,
              recommendedQuantity: prediction.recommendedQuantity ?? 1,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

