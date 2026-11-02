"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table/data-table"
import { useConfirm } from "@/hooks/use-confirm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  deleteTemplateAction,
  startShoppingSessionAction,
} from "@/app/actions/shopping.actions"
import { formatIDR } from "@/lib/format"
import type { Wallet, Category } from "@/types"

import { getShoppingColumns, type ShoppingTemplateRow } from "./columns"

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debounced
}

export function ShoppingTableClient({
  rows,
  rowCount,
  pageCount,
  initialPageIndex,
  initialPageSize,
  initialSearch,
  initialSortBy,
  initialSortOrder,
  wallets,
  categories,
}: {
  rows: ShoppingTemplateRow[]
  rowCount: number
  pageCount: number
  initialPageIndex: number
  initialPageSize: number
  initialSearch: string
  initialSortBy: "title" | "isActive" | "createdAt"
  initialSortOrder: "asc" | "desc"
  wallets: Wallet[]
  categories: Category[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const confirm = useConfirm()

  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [isStartingSession, startSessionTransition] = React.useTransition()

  const [sessionDialog, setSessionDialog] = React.useState<{
    open: boolean
    templateId: string
    title: string
  }>({
    open: false,
    templateId: "",
    title: "",
  })

  const expenseCategories = React.useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  )

  const [selectedWalletId, setSelectedWalletId] = React.useState<string>(
    wallets[0]?.id ?? ""
  )
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(
    expenseCategories[0]?.id ?? "__none__"
  )

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
  const debouncedSearch = useDebouncedValue(globalFilter, 350)

  const handleOpenStartSession = React.useCallback(
    (templateId: string, title: string) => {
      if (wallets.length === 0) {
        toast.error("Silakan buat dompet sumber dana terlebih dahulu")
        return
      }
      setSessionDialog({ open: true, templateId, title })
    },
    [wallets.length]
  )

  const handleConfirmStartSession = () => {
    if (!selectedWalletId) {
      toast.error("Pilih dompet sumber dana terlebih dahulu")
      return
    }

    startSessionTransition(async () => {
      const res = await startShoppingSessionAction({
        templateId: sessionDialog.templateId,
        walletId: selectedWalletId,
        categoryId:
          selectedCategoryId === "__none__" ? null : selectedCategoryId,
        transactionDate: new Date(),
      })

      if (!res.success) {
        toast.error(res.error ?? "Gagal memulai sesi belanja")
        return
      }

      toast.success(res.message ?? "Sesi belanja aktif berhasil dimulai")
      setSessionDialog({ open: false, templateId: "", title: "" })
      router.refresh()
    })
  }

  const handleDelete = React.useCallback(
    async (id: string, title: string) => {
      const ok = await confirm({
        title: "Hapus Template Belanja?",
        description: (
          <span>
            Anda akan menghapus template{" "}
            <Badge
              variant="destructive"
              className="mx-1 align-middle font-semibold"
            >
              {title}
            </Badge>{" "}
            beserta seluruh daftar barang di dalamnya secara permanen.
          </span>
        ),
        confirmText: "Hapus",
        cancelText: "Batal",
      })
      if (!ok) return

      setDeletingId(id)
      startDeleteTransition(async () => {
        try {
          const res = await deleteTemplateAction({ id })
          if (!res.success) {
            toast.error(res.error ?? "Gagal menghapus template")
            return
          }
          toast.success(res.message ?? "Template belanja berhasil dihapus")
          router.refresh()
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Gagal menghapus template"
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
      getShoppingColumns({
        onStartSession: handleOpenStartSession,
        onDelete: handleDelete,
        deletingId: isDeleting ? deletingId : null,
      }),
    [deletingId, handleDelete, handleOpenStartSession, isDeleting]
  )

  React.useEffect(() => {
    const nextPageIndex = initialPageIndex
    const nextPageSize = initialPageSize
    setPagination((prev) =>
      prev.pageIndex === nextPageIndex && prev.pageSize === nextPageSize
        ? prev
        : { pageIndex: nextPageIndex, pageSize: nextPageSize }
    )
  }, [initialPageIndex, initialPageSize])

  React.useEffect(() => {
    setSorting((prev) => {
      const cur = prev[0]
      const nextDesc = initialSortOrder === "desc"
      if (cur && cur.id === initialSortBy && cur.desc === nextDesc) return prev
      return [{ id: initialSortBy, desc: nextDesc }]
    })
  }, [initialSortBy, initialSortOrder])

  React.useEffect(() => {
    setGlobalFilter((prev) => (prev === initialSearch ? prev : initialSearch))
  }, [initialSearch])

  React.useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString())
    const currentQ = sp.get("q") ?? ""
    if (debouncedSearch.trim() === currentQ.trim()) return

    if (debouncedSearch.trim()) sp.set("q", debouncedSearch.trim())
    else sp.delete("q")
    sp.set("page", "1")
    const nextUrl = `${pathname}?${sp.toString()}`
    router.replace(nextUrl)
  }, [debouncedSearch, pathname, router, searchParams])

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      const sp = new URLSearchParams(searchParams?.toString())
      sp.set("page", String(next.pageIndex + 1))
      sp.set("perPage", String(next.pageSize))
      const nextUrl = `${pathname}?${sp.toString()}`
      router.replace(nextUrl)
      return next
    })
  }

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      const first = next[0]
      const sp = new URLSearchParams(searchParams?.toString())
      if (first?.id) {
        sp.set("sortBy", String(first.id))
        sp.set("sortDir", first.desc ? "desc" : "asc")
      } else {
        sp.delete("sortBy")
        sp.delete("sortDir")
      }
      sp.set("page", "1")
      const nextUrl = `${pathname}?${sp.toString()}`
      router.replace(nextUrl)
      return next
    })
  }

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        mode="server"
        rowCount={rowCount}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={handleGlobalFilterChange}
        globalSearch={{
          placeholder: "Cari nama template belanja...",
        }}
        getRowId={(r) => r.id}
      />

      <Dialog
        open={sessionDialog.open}
        onOpenChange={(open) =>
          setSessionDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mulai Sesi Belanja</DialogTitle>
            <DialogDescription>
              Pilih dompet sumber dana untuk memulai sesi belanja dari template{" "}
              <span className="font-semibold text-foreground">
                {sessionDialog.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Dompet Sumber Dana</Label>
              <Select
                value={selectedWalletId}
                onValueChange={(v) => setSelectedWalletId(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih dompet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({formatIDR(w.balance ?? 0)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Kategori Pengeluaran (Opsional)</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(v) => setSelectedCategoryId(v ?? "__none__")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Tanpa Kategori</SelectItem>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSessionDialog({ open: false, templateId: "", title: "" })
              }
              disabled={isStartingSession}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStartSession}
              disabled={isStartingSession || !selectedWalletId}
            >
              {isStartingSession ? "Memulai..." : "Mulai Belanja Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
