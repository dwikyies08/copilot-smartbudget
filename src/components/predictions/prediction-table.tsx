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
  RefreshIcon,
  Delete01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ChartHistogramIcon,
} from "@hugeicons/core-free-icons"
import {
  recalculatePredictionsAction,
  deletePredictionAction,
} from "@/app/actions/prediction.actions"
import { formatIDR, formatDateID } from "@/lib/format"
import type { PredictionWithInflation } from "@/types"

export interface PredictionTableProps {
  predictions: PredictionWithInflation[]
}

export function PredictionTable({ predictions }: PredictionTableProps) {
  const [isRecalculating, startRecalculateTransition] = React.useTransition()
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [selectedDeleteId, setSelectedDeleteId] = React.useState<string | null>(
    null
  )

  const handleRecalculate = () => {
    startRecalculateTransition(async () => {
      const res = await recalculatePredictionsAction()
      if (!res.success) {
        toast.error(res.error || "Gagal menghitung ulang prediksi")
        return
      }
      toast.success(res.message || "Prediksi harga berhasil diperbarui")
    })
  }

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      const res = await deletePredictionAction(id)
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus data prediksi")
        return
      }
      toast.success(res.message || "Prediksi berhasil dihapus")
      setSelectedDeleteId(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Prediksi Inflasi &amp; Harga Barang</h3>
          <p className="text-xs text-muted-foreground">
            Dianalisis secara otomatis dari riwayat pembelian checklist belanja Anda
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRecalculate}
          disabled={isRecalculating}
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            className={`h-4 w-4 ${isRecalculating ? "animate-spin" : ""}`}
          />
          <span>{isRecalculating ? "Menganalisis..." : "Hitung Ulang AI"}</span>
        </Button>
      </div>

      {predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon
              icon={ChartHistogramIcon}
              className="h-6 w-6 text-muted-foreground"
            />
          </div>
          <h4 className="mt-4 text-sm font-semibold">Belum Ada Analisis Prediksi</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Selesaikan sesi checklist belanja bulanan atau klik tombol "Hitung Ulang AI" untuk mengenerate proyeksi harga barang berikutnya.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="text-right">Harga Rata-rata</TableHead>
                <TableHead className="text-right">Prediksi Bulan Depan</TableHead>
                <TableHead className="text-center">Tren Harga</TableHead>
                <TableHead className="text-center">Saran Kuantitas</TableHead>
                <TableHead className="w-[80px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((p) => {
                const isRising = p.isPriceRising
                const percent = Math.abs(p.priceChangePercent ?? 0)

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">
                      {p.productName}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {formatIDR(p.averagePrice ?? 0)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatIDR(p.predictedNextPrice ?? 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={isRising ? "destructive" : "secondary"}
                        className="gap-1 text-[11px] font-normal"
                      >
                        <HugeiconsIcon
                          icon={isRising ? ArrowUp01Icon : ArrowDown01Icon}
                          className="h-3 w-3"
                        />
                        {isRising ? `+${percent}%` : `-${percent}%`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {p.recommendedQuantity ?? 1} unit
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog
                        open={selectedDeleteId === p.id}
                        onOpenChange={(open) =>
                          setSelectedDeleteId(open ? p.id : null)
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
                              <span className="sr-only">Hapus Prediksi</span>
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Prediksi Produk?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Data estimasi prediksi harga untuk produk "{p.productName}" akan dihapus.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.preventDefault()
                                handleDelete(p.id)
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
      )}
    </div>
  )
}

