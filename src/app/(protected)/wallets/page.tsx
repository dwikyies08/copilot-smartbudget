import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Wallet01Icon,
  WalletCardsIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

import {
  getWalletsListAction,
  fetchWalletsAction,
} from "@/app/actions/wallet.actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatIDR } from "@/lib/format"
import { WalletTableClient } from "./_components/wallet-table-client"
import type { WalletRow } from "./_components/columns"

export const metadata: Metadata = {
  title: "Dompet & Rekening | Smart Budget",
  description:
    "Kelola daftar dompet dan rekening untuk melacak saldo serta transaksi keuangan Anda.",
}

type WalletsPageProps = {
  searchParams: Promise<{
    page?: string
    perPage?: string
    q?: string
    sortBy?: string
    sortDir?: "asc" | "desc"
  }>
}

const sortableFields = ["name", "balance", "currency"] as const
type SortableField = (typeof sortableFields)[number]

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && sortableFields.includes(value as SortableField)
}

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = Math.max(1, Number(sp.perPage ?? 10))
  const q = sp.q ?? ""

  const sortBy: SortableField = isSortableField(sp.sortBy)
    ? sp.sortBy
    : "name"
  const sortDir = sp.sortDir === "desc" ? "desc" : "asc"

  const [result, summaryRes] = await Promise.all([
    getWalletsListAction({
      pageIndex: page - 1,
      pageSize: perPage,
      search: q,
      sortBy,
      sortOrder: sortDir,
    }),
    fetchWalletsAction(),
  ])

  const summary = summaryRes.data ?? {
    wallets: [],
    totalBalance: 0,
    walletCount: 0,
  }

  const safeRows: WalletRow[] = result.rows.map((item) => ({
    id: item.id,
    name: item.name,
    balance: item.balance ?? 0,
    currency: item.currency ?? "IDR",
  }))

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Wallet01Icon} className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Dompet &amp; Rekening
              </h1>
              <p className="text-sm text-muted-foreground">
                Pantau seluruh saldo akun, rekening bank, dan dompet digital dalam satu tempat.
              </p>
            </div>
          </div>

          <Link
            href="/wallets/create"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
            Dompet Baru
          </Link>
        </div>

        <Separator className="bg-border/50" />
      </div>

      {/* Ringkasan Saldo & Jumlah Dompet */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardDescription className="text-xs font-medium">
                Total Saldo Gabungan
              </CardDescription>
              <CardTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {formatIDR(summary.totalBalance)}
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Wallet01Icon} size={22} strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Akumulasi saldo dari seluruh dompet aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardDescription className="text-xs font-medium">
                Jumlah Dompet
              </CardDescription>
              <CardTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {summary.walletCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  Akun
                </span>
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={WalletCardsIcon} size={22} strokeWidth={2} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total dompet atau rekening yang terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1 pb-4">
          <CardTitle className="text-base">Daftar Dompet Terdaftar</CardTitle>
          <CardDescription>
            Lihat, cari, urutkan, dan kelola dompet atau rekening Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <WalletTableClient
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
