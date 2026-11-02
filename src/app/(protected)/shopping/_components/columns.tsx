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
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons"
import { formatIDR, formatDateID } from "@/lib/format"

export type ShoppingTemplateRow = {
  id: string
  title: string
  isActive: boolean
  itemCount: number
  totalEstimatedPrice: number
  itemsSummary: string
  createdAt?: Date | string | null
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<ShoppingTemplateRow, unknown>
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

function ShoppingActionsCell({
  template,
  onStartSession,
  onDelete,
  deletingId,
}: {
  template: ShoppingTemplateRow
  onStartSession: (templateId: string, title: string) => void
  onDelete: (id: string, title: string) => void
  deletingId: string | null
}) {
  const router = useRouter()
  const isDeleting = deletingId === template.id

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="default"
        size="sm"
        className="h-8 gap-1 px-2.5 text-xs"
        disabled={isDeleting}
        onClick={() => onStartSession(template.id, template.title)}
      >
        <HugeiconsIcon icon={ShoppingCart01Icon} className="size-3.5" />
        Mulai Belanja
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2.5 text-xs"
        disabled={isDeleting}
        onClick={() => router.push(`/shopping/${template.id}/edit`)}
      >
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-8 gap-1 px-2.5 text-xs"
        disabled={isDeleting}
        onClick={() => onDelete(template.id, template.title)}
      >
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
        {isDeleting ? "Menghapus..." : "Hapus"}
      </Button>
    </div>
  )
}

export function getShoppingColumns({
  onStartSession,
  onDelete,
  deletingId,
}: {
  onStartSession: (templateId: string, title: string) => void
  onDelete: (id: string, title: string) => void
  deletingId: string | null
}): ColumnDef<ShoppingTemplateRow>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column} label="Nama Template" />
      ),
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">{t.title}</div>
            <div className="truncate text-xs text-muted-foreground max-w-xs">
              {t.itemsSummary || "Belum ada daftar barang"}
            </div>
          </div>
        )
      },
      size: 280,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <SortableHeader column={column} label="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Aktif" : "Arsip"}
          </Badge>
        )
      },
      size: 110,
    },
    {
      accessorKey: "itemCount",
      header: "Jumlah Barang",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.itemCount} item
        </Badge>
      ),
      size: 130,
    },
    {
      accessorKey: "totalEstimatedPrice",
      header: "Estimasi Anggaran",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-semibold tracking-tight">
          {formatIDR(row.original.totalEstimatedPrice)}
        </span>
      ),
      size: 170,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Dibuat" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDateID(row.original.createdAt)}
        </span>
      ),
      size: 140,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ShoppingActionsCell
          template={row.original}
          onStartSession={onStartSession}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ),
      size: 280,
    },
  ]
}

