import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getTemplatesListAction,
  fetchActiveShoppingSessionAction,
} from "@/app/actions/shopping.actions"
import { fetchWalletsAction } from "@/app/actions/wallet.actions"
import { fetchCategoriesAction } from "@/app/actions/category.actions"
import { ShoppingChecklistDrawer } from "@/components/shopping/shopping-checklist-drawer"
import { formatIDR } from "@/lib/format"

import { ShoppingTableClient } from "./_components/shopping-table-client"
import type { ShoppingTemplateRow } from "./_components/columns"

type SearchParams = Record<string, string | string[] | undefined>

function getParam(sp: SearchParams, key: string): string | undefined {
  const v = sp[key]
  if (Array.isArray(v)) return v[0]
  return v
}

function toInt(v: string | undefined, fallback: number) {
  if (!v) return fallback
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

const sortableFields = ["title", "isActive", "createdAt"] as const
type SortBy = (typeof sortableFields)[number]

function isSortableField(v: string | undefined): v is SortBy {
  return Boolean(v && (sortableFields as readonly string[]).includes(v))
}

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const sp = (await searchParams) ?? {}
  const page = Math.max(1, toInt(getParam(sp, "page"), 1))
  const perPage = Math.min(100, Math.max(1, toInt(getParam(sp, "perPage"), 10)))
  const q = (getParam(sp, "q") ?? "").trim()

  const sortByRaw = getParam(sp, "sortBy")
  const sortDirRaw = getParam(sp, "sortDir")
  const sortBy: SortBy = isSortableField(sortByRaw) ? sortByRaw : "createdAt"
  const sortOrder: "asc" | "desc" = sortDirRaw === "asc" ? "asc" : "desc"

  const pageIndex = page - 1
  const pageSize = perPage

  const [{ rows, rowCount, pageCount }, activeSessionRes, walletsRes, categoriesRes] =
    await Promise.all([
      getTemplatesListAction({
        pageIndex,
        pageSize,
        search: q,
        sortBy,
        sortOrder,
      }),
      fetchActiveShoppingSessionAction(),
      fetchWalletsAction(),
      fetchCategoriesAction(),
    ])

  const activeSession = activeSessionRes.data ?? null
  const wallets = walletsRes.data?.wallets ?? []
  const categories = categoriesRes.data ?? []

  const safeRows: ShoppingTemplateRow[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    isActive: Boolean(t.isActive),
    itemCount: t.items.length,
    totalEstimatedPrice: t.totalEstimatedPrice,
    itemsSummary: t.items
      .slice(0, 4)
      .map((i) => `${i.productName} (${i.defaultQuantity ?? 1}x)`)
      .join(", "),
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
  }))

  const totalEstimatedAll = safeRows.reduce(
    (acc, r) => acc + r.totalEstimatedPrice,
    0
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={ShoppingCart01Icon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Belanja Bulanan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola daftar template belanja rutin dan checklist belanja aktif
            </p>
          </div>
        </div>

        <Link href="/shopping/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            Buat Template
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-linear-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Total Template Belanja
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {rowCount} Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Daftar template belanja rutin Anda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Estimasi Halaman Ini
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {formatIDR(totalEstimatedAll)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Akumulasi perkiraan biaya template
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Status Sesi Belanja
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {activeSession
                ? `${activeSession.checkedCount}/${activeSession.totalItems} Barang`
                : "Tidak Aktif"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {activeSession
                ? `Total aktual: ${formatIDR(activeSession.totalActualPrice)}`
                : "Klik Mulai Belanja pada tabel di bawah"}
            </p>
          </CardContent>
        </Card>
      </div>

      {activeSession && (
        <ShoppingChecklistDrawer activeSession={activeSession} />
      )}

      <Card>
        <CardHeader className="gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Daftar Template Belanja</CardTitle>
              <CardDescription>
                Cari, urutkan, mulai sesi belanja aktif, atau kelola item template
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-medium text-foreground">{rowCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ShoppingTableClient
            rows={safeRows}
            rowCount={rowCount}
            pageCount={pageCount}
            initialPageIndex={pageIndex}
            initialPageSize={pageSize}
            initialSearch={q}
            initialSortBy={sortBy}
            initialSortOrder={sortOrder}
            wallets={wallets}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  )
}
