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
  createWalletAction,
  updateWalletAction,
} from "@/app/actions/wallet.actions"
import type { Wallet } from "@/types"

export interface WalletFormDialogProps {
  wallet?: Wallet
  trigger?: React.ReactElement
}

export function WalletFormDialog({ wallet, trigger }: WalletFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const isEdit = Boolean(wallet)

  const [name, setName] = React.useState(wallet?.name ?? "")
  const [balance, setBalance] = React.useState<string | number>(
    wallet?.balance ?? 0
  )
  const [currency, setCurrency] = React.useState(wallet?.currency ?? "IDR")
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[] | undefined>
  >({})

  React.useEffect(() => {
    if (open) {
      setName(wallet?.name ?? "")
      setBalance(wallet?.balance ?? 0)
      setCurrency(wallet?.currency ?? "IDR")
      setFieldErrors({})
    }
  }, [open, wallet])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    startTransition(async () => {
      if (isEdit && wallet) {
        const res = await updateWalletAction({
          id: wallet.id,
          name: name.trim(),
          balance: Number(balance) || 0,
          currency: currency.trim() || "IDR",
        })

        if (!res.success) {
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors)
          }
          toast.error(res.error || "Gagal memperbarui dompet")
          return
        }

        toast.success(res.message || "Dompet berhasil diperbarui")
        setOpen(false)
      } else {
        const res = await createWalletAction({
          name: name.trim(),
          balance: Number(balance) || 0,
          currency: currency.trim() || "IDR",
        })

        if (!res.success) {
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors)
          }
          toast.error(res.error || "Gagal membuat dompet baru")
          return
        }

        toast.success(res.message || "Dompet berhasil ditambahkan")
        setOpen(false)
      }
    })
  }

  const defaultTrigger = (
    <Button variant="default" size="default">
      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
      <span>Tambah Dompet</span>
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || defaultTrigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Dompet" : "Tambah Dompet Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi dompet atau rekening Anda."
              : "Masukkan nama dompet dan saldo awal untuk mulai mencatat keuangan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="wallet-name">Nama Dompet</Label>
            <Input
              id="wallet-name"
              name="name"
              placeholder="Contoh: BCA, Dompet Utama, GoPay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="wallet-balance">
              {isEdit ? "Saldo Saat Ini" : "Saldo Awal"}
            </Label>
            <Input
              id="wallet-balance"
              name="balance"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              disabled={isPending}
            />
            {fieldErrors.balance && (
              <p className="text-xs text-destructive">{fieldErrors.balance[0]}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="wallet-currency">Mata Uang</Label>
            <Input
              id="wallet-currency"
              name="currency"
              placeholder="IDR"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isPending}
            />
            {fieldErrors.currency && (
              <p className="text-xs text-destructive">{fieldErrors.currency[0]}</p>
            )}
          </div>

          <DialogFooter>
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
                : "Tambah Dompet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
