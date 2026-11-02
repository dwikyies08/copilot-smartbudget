"use client"

import { useRouter } from "next/navigation"
import type { Column, ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit01Icon,
  Delete01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatIDR } from "@/lib/format"

export type WalletRow = {
  id: string
  name: string
  balance: number
  currency: string
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

function WalletActionsCell({
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
        onClick={() => router.push(`/wallets/${id}/edit`)}
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

export function getWalletColumns({
  onDelete,
  deletingId,
}: {
  onDelete: (id: string, name: string) => void
  deletingId?: string | null
}): ColumnDef<WalletRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader title="Nama Dompet / Rekening" column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5 font-medium">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Wallet01Icon} className="h-4 w-4" />
          </div>
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "currency",
      header: ({ column }) => (
        <SortableHeader title="Mata Uang" column={column} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.currency}
        </Badge>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <SortableHeader title="Saldo Saat Ini" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {formatIDR(row.original.balance)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <WalletActionsCell
          id={row.original.id}
          name={row.original.name}
          onDelete={onDelete}
          isDeleting={deletingId === row.original.id}
        />
      ),
    },
  ]
}

