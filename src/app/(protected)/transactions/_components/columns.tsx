"use client"

import { useRouter } from "next/navigation"
import type { Column, ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit01Icon,
  Delete01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Wallet01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatIDR, formatDateID } from "@/lib/format"

export type TransactionRow = {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  status: "pending" | "completed" | "failed"
  source: "manual" | "email_sync" | "shopping_list"
  referenceCode: string
  transactionDate: string
  walletName: string
  categoryName: string
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

function TransactionActionsCell({
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
        onClick={() => router.push(`/transactions/${id}/edit`)}
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

export function getTransactionColumns({
  onDelete,
  deletingId,
}: {
  onDelete: (id: string, name: string) => void
  deletingId?: string | null
}): ColumnDef<TransactionRow>[] {
  return [
    {
      accessorKey: "transactionDate",
      header: ({ column }) => (
        <SortableHeader title="Tanggal" column={column} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateID(row.original.transactionDate)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortableHeader title="Deskripsi / Catatan" column={column} />
      ),
      cell: ({ row }) => {
        const isIncome = row.original.type === "income"
        return (
          <div className="flex items-center gap-2.5">
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
                {row.original.description}
              </div>
              {row.original.referenceCode && (
                <div className="font-mono text-[11px] text-muted-foreground">
                  Ref: {row.original.referenceCode}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "categoryName",
      header: "Kategori",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1 text-xs font-normal">
          <HugeiconsIcon icon={Folder01Icon} className="h-3 w-3" />
          {row.original.categoryName}
        </Badge>
      ),
    },
    {
      accessorKey: "walletName",
      header: "Dompet",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <HugeiconsIcon
            icon={Wallet01Icon}
            className="h-3.5 w-3.5 text-muted-foreground"
          />
          {row.original.walletName}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader title="Nominal" column={column} />
      ),
      cell: ({ row }) => {
        const isIncome = row.original.type === "income"
        return (
          <span
            className={`font-mono text-sm font-semibold ${
              isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            }`}
          >
            {isIncome ? "+" : "-"} {formatIDR(row.original.amount)}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader title="Status" column={column} />
      ),
      cell: ({ row }) => {
        const st = row.original.status
        return (
          <Badge
            variant={
              st === "completed"
                ? "secondary"
                : st === "failed"
                ? "destructive"
                : "outline"
            }
            className="text-[11px]"
          >
            {st === "completed"
              ? "Selesai"
              : st === "failed"
              ? "Gagal"
              : "Pending"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <TransactionActionsCell
          id={row.original.id}
          name={row.original.description}
          onDelete={onDelete}
          isDeleting={deletingId === row.original.id}
        />
      ),
    },
  ]
}

