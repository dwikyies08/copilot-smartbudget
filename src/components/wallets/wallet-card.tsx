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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Wallet01Icon,
  Edit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import { deleteWalletAction } from "@/app/actions/wallet.actions"
import { formatIDR } from "@/lib/format"
import { WalletFormDialog } from "@/components/wallets/wallet-form-dialog"
import type { Wallet } from "@/types"

export interface WalletCardProps {
  wallet: Wallet
}

export function WalletCard({ wallet }: WalletCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isDeleting, startDeleteTransition] = React.useTransition()

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deleteWalletAction({ id: wallet.id })
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus dompet")
        return
      }
      toast.success(res.message || "Dompet berhasil dihapus")
      setIsDeleteOpen(false)
    })
  }

  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-xs">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Wallet01Icon} size={20} strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="line-clamp-1">{wallet.name}</CardTitle>
              <CardDescription className="text-[0.7rem]">
                ID: {wallet.id.slice(0, 8)}...
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
            {wallet.currency || "IDR"}
          </Badge>
        </CardHeader>

        <CardContent className="pt-2">
          <span className="text-xs text-muted-foreground">Saldo Saat Ini</span>
          <p className="font-heading text-lg font-bold tracking-tight text-foreground">
            {formatIDR(wallet.balance)}
          </p>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-end gap-2 border-t pt-3">
        <WalletFormDialog
          wallet={wallet}
          trigger={
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
              <span>Edit</span>
            </Button>
          }
        />

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                <span>Hapus</span>
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Dompet?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus dompet &quot;{wallet.name}&quot;?
                Tindakan ini tidak dapat dibatalkan dan semua data transaksi terkait dompet ini akan terhapus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
