import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon } from "@hugeicons/core-free-icons"

import { getCategoryByIdAction } from "@/app/actions/category.actions"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UpdateCategoryForm } from "./_components/update-category-form"

type EditCategoryPageProps = {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: "Edit Kategori | Smart Budget",
  description: "Perbarui nama kategori, tipe aliran kas, dan plafon anggaran.",
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params

  const result = await getCategoryByIdAction(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const category = result.data

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Edit01Icon} className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Kategori
            </h1>
            <p className="text-sm text-muted-foreground">
              Perbarui kategori:{" "}
              <span className="font-mono font-medium">{category.name}</span>
            </p>
          </div>
        </div>

        <Separator className="bg-border/50" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">Form Edit Data Kategori</CardTitle>
          <CardDescription>
            Ubah detail nama kategori, tipe kas, dan plafon anggaran bulanan.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateCategoryForm
            initialValues={{
              id: category.id,
              name: category.name,
              type: category.type,
              budgetLimit: category.budgetLimit ?? 0,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

