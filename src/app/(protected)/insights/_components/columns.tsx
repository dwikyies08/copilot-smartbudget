"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Column, ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import { formatIDR, formatDateID } from "@/lib/format"

export type PredictionRow = {
  id: string
  productName: string
  averagePrice: number
  predictedNextPrice: number
  priceChangePercent: number
  isPriceRising: boolean
  recommendedQuantity: number
  updatedAt?: Date | string | null
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<PredictionRow, unknown>
  label: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 px-2"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{label}</span>
      {sorted === "asc" ? (
        <HugeiconsIcon icon={ArrowUp01Icon} className="ml-1 size-3.5" />
      ) : sorted === "desc" ? (
        <HugeiconsIcon icon={ArrowDown01Icon} className="ml-1 size-3.5" />
      ) : null}
    </Button>
  )
}

function PredictionActionsCell({
  prediction,
  onDelete,
  deletingId,
}: {
  prediction: PredictionRow
  onDelete: (id: string, productName: string) => void
  deletingId: string | null
}) {
  const router = useRouter()
  const isDeleting = deletingId === prediction.id

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2.5 text-xs"
        disabled={isDeleting}
        onClick={() => router.push(`/insights/${prediction.id}/edit`)}
      >
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-8 gap-1 px-2.5 text-xs"
        disabled={isDeleting}
        onClick={() => onDelete(prediction.id, prediction.productName)}
      >
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
        {isDeleting ? "Menghapus..." : "Hapus"}
      </Button>
    </div>
  )
}

export function getPredictionColumns({
  onDelete,
  deletingId,
}: {
  onDelete: (id: string, productName: string) => void
  deletingId: string | null
}): ColumnDef<PredictionRow>[] {
  return [
    {
      accessorKey: "productName",
      header: ({ column }) => (
        <SortableHeader column={column} label="Nama Produk" />
      ),
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">{p.productName}</div>
            <div className="truncate text-xs text-muted-foreground">
              Rekomendasi stok: {p.recommendedQuantity} unit / bulan
            </div>
          </div>
        )
      },
      size: 240,
    },
    {
      accessorKey: "averagePrice",
      header: ({ column }) => (
        <SortableHeader column={column} label="Rata-rata Historis" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatIDR(row.original.averagePrice)}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "predictedNextPrice",
      header: ({ column }) => (
        <SortableHeader column={column} label="Prediksi Bulan Depan" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold tracking-tight">
          {formatIDR(row.original.predictedNextPrice)}
        </span>
      ),
      size: 180,
    },
    {
      accessorKey: "priceChangePercent",
      header: "Tren Inflasi",
      enableSorting: false,
      cell: ({ row }) => {
        const { priceChangePercent, isPriceRising } = row.original
        if (priceChangePercent === 0) {
          return <Badge variant="secondary">Stabil (0%)</Badge>
        }
        return (
          <Badge variant={isPriceRising ? "destructive" : "default"}>
            {isPriceRising ? `+${priceChangePercent}% Naik` : `${priceChangePercent}% Turun`}
          </Badge>
        )
      },
      size: 140,
    },
    {
      accessorKey: "recommendedQuantity",
      header: ({ column }) => (
        <SortableHeader column={column} label="Rekomendasi Qty" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.recommendedQuantity} unit
        </Badge>
      ),
      size: 140,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Diperbarui" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateID(row.original.updatedAt)}
        </span>
      ),
      size: 130,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <PredictionActionsCell
          prediction={row.original}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ),
      size: 180,
    },
  ]
}

