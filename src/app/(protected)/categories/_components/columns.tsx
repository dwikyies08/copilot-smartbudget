"use client"

import { useRouter } from "next/navigation"
import type { Column, ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit01Icon,
  Delete01Icon,
  Folder01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatIDR } from "@/lib/format"

export type CategoryRow = {
  id: string
  name: string
  type: "income" | "expense"
  budgetLimit: number
  totalSpent: number
  transactionCount: number
  percentageUsed: number
  isOverBudget: boolean
}

function SortableHeader<TData, TValue>({
  title,
  column,
}: {
  title: string
  column: Column<TData, TValue>
}) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className="h-8 px-2 font-medium"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? " ↑" : sorted === "desc" ? " ↓" : ""}
    </Button>
  )
}

function CategoryActionsCell({
  id,
  name,
  onDelete,
  isDeleting,
}: {
  id: string
  name: string
  onDelete: (id: string, name: string) => void
  isDeleting?: boolean
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => router.push(`/categories/${id}/edit`)}
      >
        <HugeiconsIcon icon={Edit01Icon} className="h-3.5 w-3.5" />
        Edit
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="gap-1.5"
        disabled={isDeleting}
        onClick={() => onDelete(id, name)}
      >
        <HugeiconsIcon icon={Delete01Icon} className="h-3.5 w-3.5" />
        {isDeleting ? "Menghapus..." : "Hapus"}
      </Button>
    </div>
  )
}

export function getCategoryColumns({
  onDelete,
  deletingId,
}: {
  onDelete: (id: string, name: string) => void
  deletingId?: string | null
}): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader title="Nama Kategori" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Folder01Icon} className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {row.original.transactionCount} transaksi bulan ini
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader title="Tipe Aliran Kas" column={column} />
      ),
      cell: ({ row }) => {
        const isExpense = row.original.type === "expense"
        return (
          <Badge variant={isExpense ? "destructive" : "secondary"}>
            {isExpense ? "Pengeluaran" : "Pemasukan"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "budgetLimit",
      header: ({ column }) => (
        <SortableHeader title="Batas Anggaran Bulanan" column={column} />
      ),
      cell: ({ row }) => {
        if (row.original.type === "income") {
          return <span className="text-xs text-muted-foreground">-</span>
        }
        return row.original.budgetLimit > 0 ? (
          <span className="font-mono font-medium">
            {formatIDR(row.original.budgetLimit)}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground">
            Tanpa batas
          </span>
        )
      },
    },
    {
      accessorKey: "totalSpent",
      header: "Realisasi Bulan Ini",
      cell: ({ row }) => {
        const { type, totalSpent, budgetLimit, percentageUsed, isOverBudget } =
          row.original

        if (type === "income") {
          return (
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {formatIDR(totalSpent)}
            </span>
          )
        }

        return (
          <div className="w-44 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-medium">
                {formatIDR(totalSpent)}
              </span>
              {budgetLimit > 0 && (
                <span
                  className={
                    isOverBudget
                      ? "flex items-center gap-0.5 font-semibold text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {isOverBudget && (
                    <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3" />
                  )}
                  {percentageUsed}%
                </span>
              )}
            </div>
            {budgetLimit > 0 && (
              <Progress
                value={Math.min(percentageUsed, 100)}
                className={`h-1.5 ${
                  isOverBudget ? "[&>div]:bg-destructive" : ""
                }`}
              />
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <CategoryActionsCell
          id={row.original.id}
          name={row.original.name}
          onDelete={onDelete}
          isDeleting={deletingId === row.original.id}
        />
      ),
    },
  ]
}

