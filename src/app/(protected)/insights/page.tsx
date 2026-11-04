import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon, Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getPredictionsListAction } from "@/app/actions/prediction.actions"
import { fetchEmailSyncSummaryAction } from "@/app/actions/email-sync.actions"
import { SyncStatusCard } from "@/components/email-sync/sync-status-card"
import { formatIDR } from "@/lib/format"

import { PredictionTableClient } from "./_components/prediction-table-client"
import type { PredictionRow } from "./_components/columns"

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

const sortableFields = [
  "productName",
  "averagePrice",
  "predictedNextPrice",
  "recommendedQuantity",
  "updatedAt",
] as const
type SortBy = (typeof sortableFields)[number]

function isSortableField(v: string | undefined): v is SortBy {
  return Boolean(v && (sortableFields as readonly string[]).includes(v))
}

export default async function InsightsPage({
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
  const sortBy: SortBy = isSortableField(sortByRaw) ? sortByRaw : "updatedAt"
  const sortOrder: "asc" | "desc" = sortDirRaw === "asc" ? "asc" : "desc"

  const pageIndex = page - 1
  const pageSize = perPage

  const [{ rows, rowCount, pageCount }, syncSummaryRes] = await Promise.all([
    getPredictionsListAction({
      pageIndex,
      pageSize,
      search: q,
      sortBy,
      sortOrder,
    }),
    fetchEmailSyncSummaryAction(),
  ])

  const syncSummary = syncSummaryRes.data ?? {
    totalSyncedEmails: 0,
    lastSyncedAt: null,
    recentLogs: [],
  }

  const safeRows: PredictionRow[] = rows.map((p) => ({
    id: p.id,
    productName: p.productName,
    averagePrice: p.averagePrice ?? 0,
    predictedNextPrice: p.predictedNextPrice ?? 0,
    priceChangePercent: p.priceChangePercent ?? 0,
    isPriceRising: p.isPriceRising ?? false,
    recommendedQuantity: p.recommendedQuantity ?? 1,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  }))

  const risingCount = safeRows.filter((r) => r.isPriceRising).length
  const totalProjectedCost = safeRows.reduce(
    (acc, r) => acc + r.predictedNextPrice * r.recommendedQuantity,
    0
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={SparklesIcon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Smart Insights &amp; Email Sync
            </h1>
            <p className="text-sm text-muted-foreground">
              Proyeksi inflasi harga barang kebutuhan dan sinkronisasi bukti transaksi email
            </p>
          </div>
        </div>

        <Link href="/insights/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            Tambah Prediksi
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-linear-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Proyeksi Belanja Bulan Depan
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {formatIDR(totalProjectedCost)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Berdasarkan harga prediksi &times; rekomendasi qty halaman ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Total Produk Dipantau
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {rowCount} Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Database pantauan harga barang rutin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Potensi Inflasi Harga
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
              {risingCount} Barang Naik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Produk dengan prediksi harga melebihi rata-rata historis
            </p>
          </CardContent>
        </Card>
      </div>

      <SyncStatusCard summary={syncSummary} />

      <Card>
        <CardHeader className="gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Daftar Prediksi Harga Produk</CardTitle>
              <CardDescription>
                Cari, urutkan, kalkulasi ulang otomatis dari belanja nyata, atau edit proyeksi harga
              </CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-medium text-foreground">{rowCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PredictionTableClient
            rows={safeRows}
            rowCount={rowCount}
            pageCount={pageCount}
            initialPageIndex={pageIndex}
            initialPageSize={pageSize}
            initialSearch={q}
            initialSortBy={sortBy}
            initialSortOrder={sortOrder}
          />
        </CardContent>
      </Card>
    </div>
  )
}
