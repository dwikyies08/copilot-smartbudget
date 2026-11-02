"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Controller,
  useForm,
  useFieldArray,
  type Resolver,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createTemplateSchema,
  type CreateTemplateInput,
} from "@/validations/shopping.schema"
import { createTemplateAction } from "@/app/actions/shopping.actions"
import { formatIDR } from "@/lib/format"

export function CreateTemplateForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(
      createTemplateSchema
    ) as unknown as Resolver<CreateTemplateInput>,
    defaultValues: {
      title: "",
      isActive: true,
      items: [
        {
          productName: "",
          defaultQuantity: 1,
          estimatedPrice: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const totalEstimated = (watchedItems ?? []).reduce(
    (sum, item) =>
      sum +
      (Number(item?.defaultQuantity) || 1) *
        (Number(item?.estimatedPrice) || 0),
    0
  )

  const onSubmit = (values: CreateTemplateInput) => {
    startTransition(async () => {
      try {
        const res = await createTemplateAction(values)
        if (!res.success) {
          toast.error(res.error ?? "Gagal membuat template belanja")
          return
        }
        toast.success(res.message ?? "Template belanja berhasil dibuat")
        router.push("/shopping")
        router.refresh()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Gagal membuat template belanja"
        )
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="rounded-xl border bg-muted/20 p-5 lg:sticky lg:top-6">
          <div className="text-sm font-medium">Panduan Template Belanja</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat daftar barang belanjaan rutin bulanan atau mingguan agar Anda
            dapat memulai sesi belanja hanya dengan sekali klik.
          </p>
          <div className="mt-4 rounded-lg border bg-background p-3">
            <div className="text-xs text-muted-foreground">
              Total Estimasi Anggaran
            </div>
            <div className="mt-0.5 text-lg font-bold text-primary">
              {formatIDR(totalEstimated)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {fields.length} barang terdaftar
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Nama Produk:</span>{" "}
              Sebutkan merek atau ukuran agar harga lebih terukur.
            </div>
            <div>
              <span className="font-medium text-foreground">
                Estimasi Harga Satuan:
              </span>{" "}
              Digunakan untuk menghitung perkiraan biaya belanja sebelum Anda
              membeli barang.
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
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Nama Template Belanja
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Contoh: Belanja Bulanan Dapur, Kebutuhan Bayi"
                      disabled={isPending}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Nama daftar belanja untuk memudahkan pencarian.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isActive"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Status Template
                    </FieldLabel>
                    <Select
                      value={field.value ? "active" : "archived"}
                      onValueChange={(v) => field.onChange(v === "active")}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                      >
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="archived">Arsip</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Template aktif siap digunakan untuk sesi belanja baru.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    Daftar Barang Belanjaan ({fields.length})
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tambahkan barang beserta jumlah default dan harga satuan.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    append({
                      productName: "",
                      defaultQuantity: 1,
                      estimatedPrice: 0,
                    })
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} className="mr-1.5 size-3.5" />
                  Tambah Barang
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((itemField, index) => (
                  <div
                    key={itemField.id}
                    className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-12 sm:items-start"
                  >
                    <div className="sm:col-span-6">
                      <Controller
                        name={`items.${index}.productName`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-xs">
                              Nama Barang #{index + 1}
                            </FieldLabel>
                            <Input
                              {...field}
                              placeholder="Contoh: Beras 5kg"
                              disabled={isPending}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Controller
                        name={`items.${index}.defaultQuantity`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-xs">Qty</FieldLabel>
                            <Input
                              id={field.name}
                              type="number"
                              min={1}
                              value={field.value ?? 1}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 1)
                              }
                              disabled={isPending}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Controller
                        name={`items.${index}.estimatedPrice`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-xs">
                              Harga Satuan (Rp)
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
                              disabled={isPending}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="flex items-end justify-end sm:col-span-1 sm:pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={fields.length <= 1 || isPending}
                        onClick={() => remove(index)}
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          className="size-4"
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
            {isPending ? "Menyimpan..." : "Simpan Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}

