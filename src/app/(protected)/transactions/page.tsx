import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Coins01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

import {
  getTransactionsListAction,
  getTransactionSummaryAction,
} from "@/app/actions/transaction.actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatIDR } from "@/lib/format"
import { TransactionTableClient } from "./_components/transaction-table-client"
import type { TransactionRow } from "./_components/columns"

export const metadata: Metadata = {
  title: "Transaksi & Mutasi | Smart Budget",
  description:
    "Catat dan pantau seluruh riwayat transaksi pemasukan dan pengeluaran keuangan Anda.",
}

type TransactionsPageProps = {
  searchParams: Promise<{
    page?: string
    perPage?: string
    q?: string
    sortBy?: string
    sortDir?: "asc" | "desc"
    from?: string
    to?: string
    type?: "income" | "expense"
  }>
}

const sortableFields = [
  "transactionDate",
  "description",
  "amount",
  "type",
  "status",
] as const

type SortableField = (typeof sortableFields)[number]

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && sortableFields.includes(value as SortableField)
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = Math.max(1, Number(sp.perPage ?? 10))
  const q = sp.q ?? ""

  const from = typeof sp.from === "string" ? sp.from : undefined
  const to = typeof sp.to === "string" ? sp.to : undefined

  const sortBy: SortableField = isSortableField(sp.sortBy)
    ? sp.sortBy
    : "transactionDate"
  const sortDir = sp.sortDir === "asc" ? "asc" : "desc"

  const [result, summaryRes] = await Promise.all([
    getTransactionsListAction({
      pageIndex: page - 1,
      pageSize: perPage,
      search: q,
      sortBy,
      sortOrder: sortDir,
      from,
      to,
      type: sp.type === "income" || sp.type === "expense" ? sp.type : undefined,
    }),
    getTransactionSummaryAction(),
  ])

  const summary = summaryRes.data ?? {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
  }

  const safeRows: TransactionRow[] = result.rows.map((item) => {
    const ensureIsoDate = (val: unknown): string => {
      if (val === null || val === undefined || val === 0) return ""
      if (val instanceof Date) {
        return isNaN(val.getTime()) ? "" : val.toISOString()
      }
      if (typeof val === "number") {
        const d = new Date(val)
        return isNaN(d.getTime()) ? "" : d.toISOString()
      }
      const d = new Date(String(val))
      return isNaN(d.getTime()) ? "" : d.toISOString()
    }

    return {
      id: item.id,
      description:
        item.description ||
        (item.type === "income" ? "Pemasukan" : "Pengeluaran"),
      amount: item.amount,
      type: item.type,
      status: item.status ?? "completed",
      source: item.source ?? "manual",
      referenceCode: item.referenceCode ?? "",
      transactionDate: ensureIsoDate(item.transactionDate),
      walletName: item.wallet?.name ?? "-",
      categoryName: item.category?.name ?? "Umum",
    }
  })

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Transaksi Keuangan
              </h1>
              <p className="text-sm text-muted-foreground">
                Catat pemasukan dan pengeluaran dengan sinkronisasi mutasi saldo instan.
              </p>
            </div>
          </div>

          <Link
            href="/transactions/create"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
            Catat Transaksi
          </Link>
        </div>

        <Separator className="bg-border/50" />
      </div>

      {/* Ringkasan Arus Kas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HugeiconsIcon icon={ArrowDownLeft01Icon} className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatIDR(summary.totalIncome)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dari seluruh transaksi selesai
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(summary.totalExpense)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.transactionCount} total catatan mutasi
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Arus Kas Bersih (Net)
            </CardTitle>
            <HugeiconsIcon
              icon={Coins01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.netBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {formatIDR(summary.netBalance)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Selisih pemasukan vs pengeluaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1 pb-4">
          <CardTitle className="text-base">Daftar Riwayat Transaksi</CardTitle>
          <CardDescription>
            Lihat, cari, urutkan, dan kelola mutasi pemasukan &amp; pengeluaran Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <TransactionTableClient
            initialData={safeRows}
            rowCount={result.rowCount}
            pageCount={result.pageCount}
            initialPage={page}
            initialPerPage={perPage}
            initialQuery={q}
            initialSorting={[{ id: sortBy, desc: sortDir === "desc" }]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
