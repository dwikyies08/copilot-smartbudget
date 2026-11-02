"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createPredictionSchema,
  type CreatePredictionInput,
} from "@/validations/prediction.schema"
import { createPredictionAction } from "@/app/actions/prediction.actions"

export function CreatePredictionForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreatePredictionInput>({
    resolver: zodResolver(
      createPredictionSchema
    ) as unknown as Resolver<CreatePredictionInput>,
    defaultValues: {
      productName: "",
      averagePrice: 0,
      predictedNextPrice: 0,
      recommendedQuantity: 1,
    },
  })

  const onSubmit = (values: CreatePredictionInput) => {
    startTransition(async () => {
      try {
        const res = await createPredictionAction(values)
        if (!res.success) {
          toast.error(res.error ?? "Gagal menambahkan prediksi produk")
          return
        }
        toast.success(res.message ?? "Data prediksi produk berhasil ditambahkan")
        router.push("/insights")
        router.refresh()
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Gagal menambahkan prediksi produk"
        )
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="rounded-xl border bg-muted/20 p-5 lg:sticky lg:top-6">
          <div className="text-sm font-medium">Panduan Prediksi Harga</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Catat rata-rata harga historis dan perkiraan harga bulan berikutnya
            untuk memantau dampak inflasi pada belanja bulanan Anda.
          </p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                Rata-rata Historis:
              </span>{" "}
              Harga pembelian rata-rata dalam beberapa bulan terakhir.
            </div>
            <div>
              <span className="font-medium text-foreground">
                Prediksi Bulan Depan:
              </span>{" "}
              Perkiraan harga terbaru di pasaran untuk bulan mendatang.
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 lg:col-span-8"
      >
        <div className="rounded-xl border bg-card p-5">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="productName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nama Produk</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Contoh: Minyak Goreng 2L, Beras Premium 5kg"
                      disabled={isPending}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Nama barang kebutuhan rutin yang ingin dipantau.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="recommendedQuantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Rekomendasi Jumlah (Unit/Bulan)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min={1}
                      value={field.value ?? 1}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 1)
                      }
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    <FieldDescription>
                      Kebutuhan stok rata-rata per bulan.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="averagePrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Rata-rata Harga Historis (Rp)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      step="500"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    <FieldDescription>
                      Harga beli rata-rata sebelumnya.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="predictedNextPrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Prediksi Harga Bulan Depan (Rp)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      step="500"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    <FieldDescription>
                      Perkiraan harga satuan untuk periode belanja berikutnya.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Prediksi"}
          </Button>
        </div>
      </form>
    </div>
  )
}

