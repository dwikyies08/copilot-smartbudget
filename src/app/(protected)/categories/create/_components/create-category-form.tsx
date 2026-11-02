"use client"

import * as React from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createCategoryAction } from "@/app/actions/category.actions"
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/validations/category.schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateCategoryForm() {
  const router = useRouter()
  const [formError, setFormError] = React.useState("")

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema) as Resolver<CreateCategoryInput>,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      type: "expense",
      budgetLimit: 0,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const selectedType = form.watch("type")

  async function onSubmit(values: CreateCategoryInput) {
    setFormError("")

    const payload: CreateCategoryInput = {
      ...values,
      budgetLimit: values.type === "income" ? 0 : values.budgetLimit,
    }

    const result = await createCategoryAction(payload)

    if (!result.success) {
      setFormError(result.error || "Gagal membuat kategori")
      toast.error("Gagal membuat kategori", {
        description: result.error,
      })
      return
    }

    toast.success("Sukses!", {
      description: result.message || "Kategori berhasil disimpan.",
    })

    router.refresh()
    router.push("/categories")
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Kolom Kiri: Informasi */}
      <div className="w-full space-y-2 lg:sticky lg:top-16 lg:h-fit lg:max-w-xs">
        <h2 className="text-xl font-semibold">Klasifikasi Anggaran</h2>
        <p className="text-sm text-muted-foreground">
          Buat kategori untuk mengelompokkan pemasukan atau pengeluaran. Untuk
          kategori pengeluaran, Anda dapat menetapkan batas anggaran bulanan.
        </p>
      </div>

      {/* Kolom Kanan: Form */}
      <form
        onSubmit={form.handleSubmit(
          (data) => onSubmit(data),
          (errors) => console.log("Form Validation Errors:", errors)
        )}
        className="flex-1 space-y-8"
        noValidate
      >
        <FieldGroup>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nama Kategori</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Contoh: Makanan & Minuman, Gaji, Transportasi"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Nama kategori untuk identifikasi pos anggaran Anda.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="type">Tipe Aliran Kas</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(v === "income" ? "income" : "expense")
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Pilih tipe...">
                        {field.value === "income"
                          ? "Pemasukan (Income)"
                          : "Pengeluaran (Expense)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">
                        Pengeluaran (Expense)
                      </SelectItem>
                      <SelectItem value="income">Pemasukan (Income)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Tentukan apakah kategori ini untuk kas masuk atau keluar.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {selectedType === "expense" && (
            <Controller
              name="budgetLimit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="budgetLimit">
                    Batas Anggaran Bulanan (Rp)
                  </FieldLabel>
                  <Input
                    id="budgetLimit"
                    type="number"
                    min={0}
                    step="10000"
                    placeholder="0 (Tanpa batas)"
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Isi 0 jika tidak ingin menetapkan plafon pengeluaran bulanan
                    pada kategori ini.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </FieldGroup>

        {formError && (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        )}

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/categories")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Kategori Baru"}
          </Button>
        </div>
      </form>
    </div>
  )
}

