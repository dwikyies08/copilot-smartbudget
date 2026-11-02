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
import { createTransactionAction } from "@/app/actions/transaction.actions"
import type { Wallet, Category, TransactionType } from "@/types"

export interface TransactionFormDialogProps {
  wallets: Wallet[]
  categories: Category[]
  trigger?: React.ReactElement
}

export function TransactionFormDialog({
  wallets,
  categories,
  trigger,
}: TransactionFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const [type, setType] = React.useState<TransactionType>("expense")
  const [walletId, setWalletId] = React.useState<string>(wallets[0]?.id ?? "")
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [amount, setAmount] = React.useState<string | number>("")
  const [description, setDescription] = React.useState("")
  const [transactionDate, setTransactionDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>(
    {}
  )

  React.useEffect(() => {
    if (open) {
      setType("expense")
      setWalletId(wallets[0]?.id ?? "")
      setCategoryId("")
      setAmount("")
      setDescription("")
      setTransactionDate(new Date().toISOString().split("T")[0])
      setFieldErrors({})
    }
  }, [open, wallets])

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    startTransition(async () => {
      const res = await createTransactionAction({
        walletId,
        categoryId: categoryId || null,
        amount: Number(amount),
        type,
        description: description.trim() || null,
        status: "completed",
        source: "manual",
        transactionDate: new Date(transactionDate),
      })

      if (!res.success) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors as Record<string, string[]>)
        }
        toast.error(res.error || "Gagal mencatat transaksi")
        return
      }

      toast.success(res.message || "Transaksi berhasil dicatat")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="gap-2">
              <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
              <span>Catat Transaksi</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Catat Transaksi Baru</DialogTitle>
            <DialogDescription>
              Pemasukan atau pengeluaran akan langsung memperbarui saldo dompet terkait.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tipe Transaksi</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setType("expense")
                    setCategoryId("")
                  }}
                  disabled={isPending}
                >
                  Pengeluaran
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setType("income")
                    setCategoryId("")
                  }}
                  disabled={isPending}
                >
                  Pemasukan
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tx-amount">Nominal (Rp)</Label>
              <Input
                id="tx-amount"
                type="number"
                min="1"
                step="500"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                required
              />
              {fieldErrors.amount && (
                <p className="text-xs text-destructive">{fieldErrors.amount[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="tx-wallet">Dompet / Rekening</Label>
                <select
                  id="tx-wallet"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  disabled={isPending || wallets.length === 0}
                  required
                >
                  {wallets.length === 0 && (
                    <option value="">Belum ada dompet</option>
                  )}
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.walletId && (
                  <p className="text-xs text-destructive">{fieldErrors.walletId[0]}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tx-category">Kategori</Label>
                <select
                  id="tx-category"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">Tanpa Kategori</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tx-date">Tanggal</Label>
              <Input
                id="tx-date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tx-desc">Catatan / Deskripsi (Opsional)</Label>
              <Input
                id="tx-desc"
                placeholder="Contoh: Belanja mingguan, makan siang kantor"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>
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
            <Button type="submit" disabled={isPending || !walletId}>
              {isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

