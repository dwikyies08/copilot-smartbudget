"use client"

import * as React from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createTransactionAction } from "@/app/actions/transaction.actions"
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/validations/transaction.schema"
import type { Wallet, Category } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

type CreateTransactionFormProps = {
  wallets: Wallet[]
  categories: Category[]
}

export function CreateTransactionForm({
  wallets,
  categories,
}: CreateTransactionFormProps) {
  const router = useRouter()
  const [formError, setFormError] = React.useState("")

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(
      createTransactionSchema
    ) as Resolver<CreateTransactionInput>,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      walletId: wallets[0]?.id ?? "",
      categoryId: "",
      amount: 0,
      type: "expense",
      description: "",
      referenceCode: "",
      status: "completed",
      source: "manual",
      transactionDate: new Date(),
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const selectedType = form.watch("type")
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  async function onSubmit(values: CreateTransactionInput) {
    setFormError("")

    const payload: CreateTransactionInput = {
      ...values,
      categoryId: values.categoryId ? values.categoryId : null,
      description: values.description?.trim() || null,
      referenceCode: values.referenceCode?.trim() || null,
    }

    const result = await createTransactionAction(payload)

    if (!result.success) {
      setFormError(result.error || "Gagal mencatat transaksi")
      toast.error("Gagal mencatat transaksi", {
        description: result.error,
      })
      return
    }

    toast.success("Sukses!", {
      description: result.message || "Transaksi berhasil disimpan.",
    })

    router.refresh()
    router.push("/transactions")
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Kolom Kiri: Informasi */}
      <div className="w-full space-y-2 lg:sticky lg:top-16 lg:h-fit lg:max-w-xs">
        <h2 className="text-xl font-semibold">Pencatatan Transaksi</h2>
        <p className="text-sm text-muted-foreground">
          Masukkan detail pemasukan atau pengeluaran. Saldo pada dompet yang
          dipilih akan diperbarui secara otomatis saat transaksi berstatus
          Selesai.
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
          {/* Baris 1: Tipe & Nominal */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="type">Tipe Transaksi</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      const nextType = v === "income" ? "income" : "expense"
                      field.onChange(nextType)
                      form.setValue("categoryId", "")
                    }}
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
                    Pilih jenis mutasi dana yang ingin dicatat.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="amount">Nominal Transaksi (Rp)</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    step="1000"
                    placeholder="Contoh: 50000"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Jumlah uang yang masuk atau keluar (wajib lebih dari 0).
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Baris 2: Dompet & Kategori */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Controller
              name="walletId"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedWallet = wallets.find((w) => w.id === field.value)
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="walletId">Dompet / Rekening</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v ?? "")}
                      disabled={isSubmitting || wallets.length === 0}
                    >
                      <SelectTrigger id="walletId" className="w-full">
                        <SelectValue placeholder="Pilih dompet...">
                          {selectedWallet
                            ? selectedWallet.name
                            : "Pilih dompet..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Rekening sumber atau tujuan mutasi dana.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedCat = filteredCategories.find(
                  (c) => c.id === field.value
                )
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="categoryId">Kategori</FieldLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? "" : v ?? "")
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="categoryId" className="w-full">
                        <SelectValue placeholder="Pilih kategori...">
                          {selectedCat ? selectedCat.name : "Tanpa Kategori"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Kategori</SelectItem>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Pos kategori anggaran yang sesuai dengan tipe transaksi.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />
          </div>

          {/* Baris 3: Tanggal, Status, & Kode Referensi */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Controller
              name="transactionDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="transactionDate">
                    Tanggal Transaksi
                  </FieldLabel>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={
                      field.value instanceof Date &&
                      !isNaN(field.value.getTime())
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : new Date()
                      )
                    }
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Tanggal terjadinya transaksi.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Status Transaksi</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(
                        (v as "pending" | "completed" | "failed") ?? "completed"
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Pilih status...">
                        {field.value === "completed"
                          ? "Selesai (Completed)"
                          : field.value === "pending"
                          ? "Menunggu (Pending)"
                          : "Gagal (Failed)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">
                        Selesai (Completed)
                      </SelectItem>
                      <SelectItem value="pending">
                        Menunggu (Pending)
                      </SelectItem>
                      <SelectItem value="failed">Gagal (Failed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Hanya transaksi selesai yang memotong/menambah saldo.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="referenceCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="referenceCode">
                    Kode Referensi (Opsional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id="referenceCode"
                    value={field.value ?? ""}
                    placeholder="Contoh: INV-202610-001"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    Nomor struk atau referensi bukti pembayaran.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Baris 4: Deskripsi */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">
                  Deskripsi / Catatan Transaksi
                </FieldLabel>
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Contoh: Makan siang kantor, pembayaran listrik bulanan..."
                  disabled={isSubmitting}
                  value={field.value ?? ""}
                />
                <FieldDescription>
                  Keterangan tambahan untuk memudahkan pencarian riwayat mutasi.
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
            onClick={() => router.push("/transactions")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </div>
      </form>
    </div>
  )
}

