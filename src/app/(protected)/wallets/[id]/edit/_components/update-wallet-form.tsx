"use client"

import * as React from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateWalletAction } from "@/app/actions/wallet.actions"
import {
  updateWalletSchema,
  type UpdateWalletInput,
} from "@/validations/wallet.schema"

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

type UpdateWalletFormProps = {
  initialValues: {
    id: string
    name: string
    balance: number
    currency: string
  }
}

export function UpdateWalletForm({ initialValues }: UpdateWalletFormProps) {
  const router = useRouter()
  const [formError, setFormError] = React.useState("")

  const form = useForm<UpdateWalletInput>({
    resolver: zodResolver(updateWalletSchema) as Resolver<UpdateWalletInput>,
    defaultValues: {
      id: initialValues.id,
      name: initialValues.name,
      balance: initialValues.balance,
      currency: initialValues.currency,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: UpdateWalletInput) {
    setFormError("")

    const result = await updateWalletAction(values)

    if (!result.success) {
      setFormError(result.error || "Gagal memperbarui dompet")
      toast.error("Gagal memperbarui dompet", {
        description: result.error,
      })
      return
    }

    toast.success("Berhasil!", {
      description: result.message || "Data dompet berhasil diperbarui.",
    })
    router.refresh()
    router.push("/wallets")
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Kolom Kiri: Informasi */}
      <div className="w-full space-y-2 lg:sticky lg:top-16 lg:h-fit lg:max-w-xs">
        <h2 className="text-xl font-semibold">Edit Data Dompet</h2>
        <p className="text-sm text-muted-foreground">
          Perbarui nama rekening, mata uang, atau sesuaikan nominal saldo dompet
          Anda.
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
                  <FieldLabel htmlFor="name">Nama Dompet / Rekening</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    value={field.value ?? ""}
                    placeholder="Contoh: BCA Utama, GoPay"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Nama unik untuk mengenali sumber dana transaksi Anda.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="currency"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="currency">Mata Uang</FieldLabel>
                  <Select
                    value={field.value ?? "IDR"}
                    onValueChange={(v) => field.onChange(v ?? "IDR")}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Pilih mata uang...">
                        {field.value || "IDR"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah Indonesia)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Mata uang standar pencatatan untuk rekening ini.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="balance"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="balance">Saldo Saat Ini (Rp)</FieldLabel>
                <Input
                  id="balance"
                  type="number"
                  min={0}
                  step="1000"
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Sesuaikan saldo dompet jika terdapat koreksi saldo manual.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {formError && (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        )}

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/wallets")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? "Menyimpan..." : "Update Data Dompet"}
          </Button>
        </div>
      </form>
    </div>
  )
}

