import Link from "next/link"
import { notFound } from "next/navigation"
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
import { getTemplateByIdAction } from "@/app/actions/shopping.actions"

import { UpdateTemplateForm } from "./_components/update-template-form"

export default async function EditShoppingTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getTemplateByIdAction(id)
  if (!res.success || !res.data) notFound()

  const template = res.data

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Edit Template Belanja
            </h1>
            <p className="text-sm text-muted-foreground">
              Perbarui daftar belanja{" "}
              <span className="font-medium text-foreground">
                {template.title}
              </span>
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
          <CardTitle>Form Edit Template Belanja</CardTitle>
          <CardDescription>
            Perubahan akan langsung berlaku untuk sesi belanja berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateTemplateForm
            initialValues={{
              id: template.id,
              title: template.title,
              isActive: Boolean(template.isActive),
              items:
                template.items.length > 0
                  ? template.items.map((item) => ({
                      productName: item.productName,
                      defaultQuantity: item.defaultQuantity ?? 1,
                      estimatedPrice: item.estimatedPrice ?? 0,
                    }))
                  : [
                      {
                        productName: "",
                        defaultQuantity: 1,
                        estimatedPrice: 0,
                      },
                    ],
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

