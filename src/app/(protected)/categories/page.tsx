import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  Tag01Icon,
  PieChart01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

import {
  getCategoriesListAction,
  fetchCategoriesWithSpendAction,
} from "@/app/actions/category.actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatIDR } from "@/lib/format"
import { CategoryTableClient } from "./_components/category-table-client"
import type { CategoryRow } from "./_components/columns"

export const metadata: Metadata = {
  title: "Kategori & Batas Anggaran | Smart Budget",
  description:
    "Kelola kategori pemasukan & pengeluaran serta tetapkan batas anggaran bulanan.",
}

type CategoriesPageProps = {
  searchParams: Promise<{
    page?: string
    perPage?: string
    q?: string
    sortBy?: string
    sortDir?: "asc" | "desc"
    type?: "income" | "expense"
  }>
}

const sortableFields = ["name", "type", "budgetLimit"] as const
type SortableField = (typeof sortableFields)[number]

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && sortableFields.includes(value as SortableField)
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = Math.max(1, Number(sp.perPage ?? 10))
  const q = sp.q ?? ""

  const sortBy: SortableField = isSortableField(sp.sortBy)
    ? sp.sortBy
    : "name"
  const sortDir = sp.sortDir === "desc" ? "desc" : "asc"

  const [result, allCategoriesRes] = await Promise.all([
    getCategoriesListAction({
      pageIndex: page - 1,
      pageSize: perPage,
      search: q,
      sortBy,
      sortOrder: sortDir,
      type: sp.type === "income" || sp.type === "expense" ? sp.type : undefined,
    }),
    fetchCategoriesWithSpendAction(),
  ])

  const allCategories = allCategoriesRes.data ?? []
  const expenseCategories = allCategories.filter((c) => c.type === "expense")
  const incomeCategories = allCategories.filter((c) => c.type === "income")

  const totalBudgetLimit = expenseCategories.reduce(
    (acc, curr) => acc + (curr.budgetLimit ?? 0),
    0
  )
  const totalExpenseMonth = expenseCategories.reduce(
    (acc, curr) => acc + (curr.totalSpent ?? 0),
    0
  )

  const safeRows: CategoryRow[] = result.rows.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    budgetLimit: item.budgetLimit ?? 0,
    totalSpent: item.totalSpent ?? 0,
    transactionCount: item.transactionCount ?? 0,
    percentageUsed: item.percentageUsed ?? 0,
    isOverBudget: item.isOverBudget ?? false,
  }))

  return (
    <div className="flex animate-in flex-col gap-6 p-4 duration-500 fade-in md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Folder01Icon} className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Kategori &amp; Anggaran
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola klasifikasi arus kas dan kontrol batas pengeluaran bulanan Anda.
              </p>
            </div>
          </div>

          <Link
            href="/categories/create"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
            Kategori Baru
          </Link>
        </div>

        <Separator className="bg-border/50" />
      </div>

      {/* Ringkasan Anggaran */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <HugeiconsIcon
              icon={Folder01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCategories.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {expenseCategories.length} Pengeluaran · {incomeCategories.length}{" "}
              Pemasukan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plafon Anggaran</CardTitle>
            <HugeiconsIcon
              icon={Tag01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalBudgetLimit)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total batas limit pengeluaran bulanan
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Realisasi Pengeluaran
            </CardTitle>
            <HugeiconsIcon
              icon={PieChart01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(totalExpenseMonth)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalBudgetLimit > 0
                ? `${Math.round(
                    (totalExpenseMonth / totalBudgetLimit) * 100
                  )}% dari batas limit`
                : "Belum ada limit bulanan"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="gap-1 pb-4">
          <CardTitle className="text-base">Daftar Kategori &amp; Anggaran</CardTitle>
          <CardDescription>
            Lihat, cari, urutkan, dan pantau pemakaian batas anggaran kategori.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CategoryTableClient
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
