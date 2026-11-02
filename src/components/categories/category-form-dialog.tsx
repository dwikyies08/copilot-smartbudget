"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/actions/category.actions"
import type { Category, CategoryType } from "@/types"

export interface CategoryFormDialogProps {
  category?: Category
  trigger?: React.ReactElement
}

export function CategoryFormDialog({
  category,
  trigger,
}: CategoryFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const isEdit = Boolean(category)

  const [name, setName] = React.useState(category?.name ?? "")
  const [type, setType] = React.useState<CategoryType>(
    (category?.type as CategoryType) ?? "expense"
  )
  const [budgetLimit, setBudgetLimit] = React.useState<string | number>(
    category?.budgetLimit ?? 0
  )
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>(
    {}
  )

  React.useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setType((category?.type as CategoryType) ?? "expense")
      setBudgetLimit(category?.budgetLimit ?? 0)
      setFieldErrors({})
    }
  }, [open, category])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    startTransition(async () => {
      if (isEdit && category) {
        const res = await updateCategoryAction({
          id: category.id,
          name,
          type,
          budgetLimit: Number(budgetLimit) || 0,
        })

        if (!res.success) {
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors as Record<string, string[]>)
          }
          toast.error(res.error || "Gagal memperbarui kategori")
          return
        }

        toast.success(res.message || "Kategori berhasil diperbarui")
        setOpen(false)
      } else {
        const res = await createCategoryAction({
          name,
          type,
          budgetLimit: Number(budgetLimit) || 0,
        })

        if (!res.success) {
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors as Record<string, string[]>)
          }
          toast.error(res.error || "Gagal menambahkan kategori")
          return
        }

        toast.success(res.message || "Kategori berhasil ditambahkan")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="gap-2">
              <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
              <span>Tambah Kategori</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Ubah Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui rincian kategori dan batas anggaran bulanan."
                : "Masukkan nama kategori, tipe aliran kas, dan target limit anggaran."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input
                id="category-name"
                name="name"
                placeholder="Contoh: Makanan & Minuman, Gaji, dll"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-type">Tipe Aliran Kas</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setType("expense")}
                  disabled={isPending}
                >
                  Pengeluaran (Expense)
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setType("income")}
                  disabled={isPending}
                >
                  Pemasukan (Income)
                </Button>
              </div>
              {fieldErrors.type && (
                <p className="text-xs text-destructive">{fieldErrors.type[0]}</p>
              )}
            </div>

            {type === "expense" && (
              <div className="grid gap-2">
                <Label htmlFor="category-budgetLimit">
                  Batas Anggaran Bulanan (Rp)
                </Label>
                <Input
                  id="category-budgetLimit"
                  name="budgetLimit"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0 (Tidak terbatas)"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Isi 0 jika tidak ingin menetapkan batas pengeluaran.
                </p>
                {fieldErrors.budgetLimit && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.budgetLimit[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

