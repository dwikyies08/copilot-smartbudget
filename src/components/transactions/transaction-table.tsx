"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Delete01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Wallet01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"
import { deleteTransactionAction } from "@/app/actions/transaction.actions"
import { formatIDR, formatDateID } from "@/lib/format"
import type { TransactionWithRelations } from "@/types"

export interface TransactionTableProps {
  transactions: TransactionWithRelations[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [selectedDeleteId, setSelectedDeleteId] = React.useState<string | null>(
    null
  )

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      const res = await deleteTransactionAction(id)
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus transaksi")
        return
      }
      toast.success(res.message || "Transaksi berhasil dihapus")
      setSelectedDeleteId(null)
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center animate-in fade-in-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon
            icon={Wallet01Icon}
            className="h-6 w-6 text-muted-foreground"
          />
        </div>
        <h3 className="mt-4 text-base font-semibold">Belum Ada Transaksi</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Semua catatan mutasi arus kas pemasukan dan pengeluaran akan ditampilkan di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead>Deskripsi / Catatan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Dompet</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="w-[80px] text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const isIncome = tx.type === "income"

            return (
              <TableRow key={tx.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateID(tx.transactionDate)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={isIncome ? ArrowDownLeft01Icon : ArrowUpRight01Icon}
                        className="h-4 w-4"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {tx.description || (isIncome ? "Pemasukan" : "Pengeluaran")}
                      </div>
                      {tx.referenceCode && (
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Ref: {tx.referenceCode}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {tx.category ? (
                    <Badge variant="outline" className="gap-1 font-normal text-xs">
                      <HugeiconsIcon icon={Folder01Icon} className="h-3 w-3" />
                      {tx.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Umum
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {tx.wallet ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <HugeiconsIcon
                        icon={Wallet01Icon}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                      {tx.wallet.name}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold text-sm ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatIDR(tx.amount)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <AlertDialog
                    open={selectedDeleteId === tx.id}
                    onOpenChange={(open) =>
                      setSelectedDeleteId(open ? tx.id : null)
                    }
                  >
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                          <span className="sr-only">Hapus Transaksi</span>
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Transaksi Ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini akan membatalkan transaksi dan mengembalikan
                          saldo pada dompet{" "}
                          <strong>{tx.wallet?.name ?? "terkait"}</strong> secara otomatis.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            handleDelete(tx.id)
                          }}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
