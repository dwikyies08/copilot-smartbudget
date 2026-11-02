"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

import { DataTable } from "@/components/data-table/data-table"
import type { DataTableState } from "@/components/data-table/types"
import { useConfirm } from "@/hooks/use-confirm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  deletePredictionAction,
  recalculatePredictionsAction,
} from "@/app/actions/prediction.actions"

import { getPredictionColumns, type PredictionRow } from "./columns"

function setOrDelete(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key)
    return
  }
  params.set(key, value)
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debounced
}

export function PredictionTableClient({
  rows,
  rowCount,
  pageCount,
  initialPageIndex,
  initialPageSize,
  initialSearch,
  initialSortBy,
  initialSortOrder,
}: {
  rows: PredictionRow[]
  rowCount: number
  pageCount: number
  initialPageIndex: number
  initialPageSize: number
  initialSearch: string
  initialSortBy:
    | "productName"
    | "averagePrice"
    | "predictedNextPrice"
    | "recommendedQuantity"
    | "updatedAt"
  initialSortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const confirm = useConfirm()

  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [isRecalculating, startRecalculateTransition] = React.useTransition()

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })
  const [sorting, setSorting] = React.useState<SortingState>(() => [
    { id: initialSortBy, desc: initialSortOrder === "desc" },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState(initialSearch)
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 400)

  const state: DataTableState = {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
  }

  const handlePaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updaterOrValue) => {
      setPagination((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
    },
    []
  )

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updaterOrValue) => {
      setSorting((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    []
  )

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> =
    React.useCallback((updaterOrValue) => {
      setColumnFilters((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, [])

  const handleGlobalFilterChange: OnChangeFn<string> = React.useCallback(
    (updaterOrValue) => {
      setGlobalFilter((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    []
  )

  React.useEffect(() => {
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

  const handleRecalculate = () => {
    startRecalculateTransition(async () => {
      const res = await recalculatePredictionsAction()
      if (!res.success) {
        toast.error(res.error ?? "Gagal menghitung ulang prediksi")
        return
      }
      toast.success(
        res.message ?? "Prediksi harga berhasil dihitung ulang dari transaksi"
      )
      router.refresh()
    })
  }

  const handleDelete = React.useCallback(
    async (id: string, productName: string) => {
      const ok = await confirm({
        title: "Hapus Prediksi Produk?",
        description: (
          <span>
            Anda akan menghapus proyeksi harga untuk produk{" "}
            <Badge
              variant="destructive"
              className="mx-1 align-middle font-semibold"
            >
              {productName}
            </Badge>{" "}
            secara permanen.
          </span>
        ),
        confirmText: "Hapus",
        cancelText: "Batal",
      })
      if (!ok) return

      setDeletingId(id)
      startDeleteTransition(async () => {
        try {
          const res = await deletePredictionAction({ id })
          if (!res.success) {
            toast.error(res.error ?? "Gagal menghapus prediksi produk")
            return
          }
          toast.success(res.message ?? "Data prediksi berhasil dihapus")
          router.refresh()
        } catch (err) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Gagal menghapus prediksi produk"
          )
        } finally {
          setDeletingId(null)
        }
      })
    },
    [confirm, router]
  )

  const columns = React.useMemo(
    () =>
      getPredictionColumns({
        onDelete: handleDelete,
        deletingId: isDeleting ? deletingId : null,
      }),
    [deletingId, handleDelete, isDeleting]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRecalculate}
          disabled={isRecalculating}
        >
          <HugeiconsIcon icon={SparklesIcon} className="mr-1.5 size-4" />
          {isRecalculating
            ? "Menghitung Ulang..."
            : "Kalkulasi Otomatis dari Riwayat Belanja"}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
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
        searchPlaceholder="Cari nama produk..."
        pageSizeOptions={[5, 10, 20, 50]}
        emptyText="Belum ada data prediksi produk"
      />
    </div>
  )
}
