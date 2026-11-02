"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingCart01Icon,
  PlayIcon,
  Delete01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"
import {
  startShoppingSessionAction,
  deleteTemplateAction,
} from "@/app/actions/shopping.actions"
import { formatIDR } from "@/lib/format"
import type { TemplateWithItems, Wallet, Category } from "@/types"

export interface TemplateCardProps {
  template: TemplateWithItems
  wallets: Wallet[]
  categories: Category[]
}

export function TemplateCard({
  template,
  wallets,
  categories,
}: TemplateCardProps) {
  const [isStarting, startSessionTransition] = React.useTransition()
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [startDialogOpen, setStartDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const [selectedWalletId, setSelectedWalletId] = React.useState<string>(
    wallets[0]?.id ?? ""
  )
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("")

  const handleStartSession = () => {
    if (!selectedWalletId) {
      toast.error("Pilih dompet sumber dana terlebih dahulu")
      return
    }

    startSessionTransition(async () => {
      const res = await startShoppingSessionAction({
        templateId: template.id,
        walletId: selectedWalletId,
        categoryId: selectedCategoryId || null,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal memulai sesi belanja")
        return
      }

      toast.success(res.message || "Sesi belanja aktif berhasil dimulai")
      setStartDialogOpen(false)
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deleteTemplateAction(template.id)
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus template")
        return
      }
      toast.success(res.message || "Template belanja berhasil dihapus")
      setDeleteDialogOpen(false)
    })
  }

  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-xs">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingBag01Icon} className="h-4 w-4 text-primary" />
              {template.title}
            </CardTitle>
            <CardDescription>
              {template.itemCount} barang dalam daftar
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Estimasi: {formatIDR(template.totalEstimatedPrice)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-medium text-muted-foreground">
              Daftar Barang:
            </div>
            <ul className="text-xs space-y-1 max-h-32 overflow-y-auto pr-1">
              {template.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                >
                  <span className="truncate max-w-[150px]">
                    {item.productName} ({item.defaultQuantity}x)
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {formatIDR((item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t pt-3">
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} className="h-3.5 w-3.5" />
                <span className="text-xs">Hapus</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Template "{template.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus template belanja rutin beserta item-itemnya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="h-8 gap-1.5 px-3">
                <HugeiconsIcon icon={PlayIcon} className="h-3.5 w-3.5" />
                <span className="text-xs">Mulai Belanja</span>
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mulai Sesi Belanja: {template.title}</DialogTitle>
              <DialogDescription>
                Pilih rekening dompet untuk memotong estimasi total belanja{" "}
                <strong>{formatIDR(template.totalEstimatedPrice)}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="session-wallet">Dompet Sumber Dana</Label>
                <select
                  id="session-wallet"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  disabled={isStarting}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatIDR(w.balance ?? 0)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session-category">Kategori Pengeluaran</Label>
                <select
                  id="session-category"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={isStarting}
                >
                  <option value="">Belanja Rumah Tangga (Default)</option>
                  {categories
                    .filter((c) => c.type === "expense")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStartDialogOpen(false)}
                disabled={isStarting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleStartSession}
                disabled={isStarting || !selectedWalletId}
              >
                {isStarting ? "Membuat Sesi..." : "Konfirmasi & Mulai"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

