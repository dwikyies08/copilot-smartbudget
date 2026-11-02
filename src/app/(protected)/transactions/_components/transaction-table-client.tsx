"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table/data-table"
import type { DataTableState } from "@/components/data-table/types"
import { deleteTransactionAction } from "@/app/actions/transaction.actions"
import { useConfirm } from "@/hooks/use-confirm"
import { Badge } from "@/components/ui/badge"
import { getTransactionColumns, type TransactionRow } from "./columns"

type Props = {
  initialData: TransactionRow[]
  rowCount: number
  pageCount: number
  initialPage: number
  initialPerPage: number
  initialQuery: string
  initialSorting: SortingState
}

function setOrDelete(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key)
    return
  }

  params.set(key, value)
}

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

export function TransactionTableClient({
  initialData,
  rowCount,
  pageCount,
  initialPage,
  initialPerPage,
  initialQuery,
  initialSorting,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const confirm = useConfirm()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage - 1,
    pageSize: initialPerPage,
  })

  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>(initialQuery)

  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 400)

  const state: DataTableState = {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
  }

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      setPagination((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
    },
    []
  )

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      setSorting((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }))
    },
    []
  )

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updaterOrValue) => {
      setColumnFilters((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }))
    },
    []
  )

  const handleGlobalFilterChange: OnChangeFn<string> = useCallback(
    (updaterOrValue) => {
      setGlobalFilter((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )

      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }))
    },
    []
  )

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    setOrDelete(params, "page", String(pagination.pageIndex + 1))
    setOrDelete(params, "perPage", String(pagination.pageSize))
    setOrDelete(params, "q", debouncedGlobalFilter)

    const firstSort = sorting[0]
    setOrDelete(params, "sortBy", firstSort?.id)
    setOrDelete(
      params,
      "sortDir",
      firstSort ? (firstSort.desc ? "desc" : "asc") : undefined
    )

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname
    const currentUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl)
    }
  }, [
    debouncedGlobalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    pathname,
    router,
    searchParams,
    sorting,
  ])

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = await confirm({
        title: "Hapus Transaksi?",
        description: (
          <>
            Transaksi{" "}
            <Badge variant="destructive">
              <span className="font-semibold">{name}</span>
            </Badge>{" "}
            akan dihapus dan saldo pada dompet terkait akan dikembalikan secara
            otomatis (rollback).
          </>
        ),
        confirmText: "Hapus Transaksi",
        cancelText: "Batal",
      })

      if (!confirmed) return

      setDeletingId(id)

      startTransition(async () => {
        const result = await deleteTransactionAction(id)

        if (!result.success) {
          toast.error(result.error || "Gagal menghapus transaksi.")
          setDeletingId(null)
          return
        }

        toast.success(result.message || "Transaksi berhasil dihapus.")
        setDeletingId(null)
      })
    },
    [confirm, startTransition]
  )

  const columns = useMemo(
    () =>
      getTransactionColumns({
        onDelete: handleDelete,
        deletingId,
      }),
    [handleDelete, deletingId]
  )

  return (
    <DataTable
      columns={columns}
      data={initialData}
      state={state}
      handlers={{
        onPaginationChange: handlePaginationChange,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onGlobalFilterChange: handleGlobalFilterChange,
      }}
      mode="server"
      rowCount={rowCount}
      pageCount={pageCount}
      searchPlaceholder="Cari deskripsi atau kode referensi..."
      pageSizeOptions={[5, 10, 20, 50]}
      emptyText="Belum ada data transaksi tercatat"
    />
  )
}

