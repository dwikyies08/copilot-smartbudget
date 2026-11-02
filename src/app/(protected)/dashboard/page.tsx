import type { Metadata } from "next"
import Link from "next/link"
import { fetchDashboardOverviewAction } from "@/app/actions/dashboard.actions"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Wallet01Icon,
  ShoppingCart01Icon,
  DashboardSquare01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { formatIDR, formatDateID } from "@/lib/format"

export const metadata: Metadata = {
  title: "Dashboard Keuangan | Smart Budget",
  description:
    "Ikhtisar finansial, tren arus kas, pemantauan anggaran kategori, dan mutasi saldo terbaru.",
}

export default async function DashboardPage() {
  const response = await fetchDashboardOverviewAction()

  const data = response.data ?? {
    totalBalance: 0,
    walletCount: 0,
    thisMonthIncome: 0,
    thisMonthExpense: 0,
    thisMonthNet: 0,
    activeShoppingCount: 0,
    cashflowSeries: [],
    categoryBudgets: [],
    recentTransactions: [],
  }

  const {
    totalBalance,
    walletCount,
    thisMonthIncome,
    thisMonthExpense,
    thisMonthNet,
    activeShoppingCount,
    cashflowSeries,
    categoryBudgets,
    recentTransactions,
  } = data

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={DashboardSquare01Icon} className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Ikhtisar Keuangan Pribadi
            </h1>
            <p className="text-sm text-muted-foreground">
              Pantau arus kas, realisasi anggaran belanja, dan mutasi saldo akun Anda
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeShoppingCount > 0 && (
            <Link href="/shopping">
              <Button
                variant="outline"
                className="gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <HugeiconsIcon icon={ShoppingCart01Icon} className="size-4" />
                <span>Sesi Belanja Aktif</span>
              </Button>
            </Link>
          )}
          <Link href="/transactions/create">
            <Button>
              <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
              Catat Transaksi
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      <SummaryCards
        totalBalance={totalBalance}
        walletCount={walletCount}
        thisMonthIncome={thisMonthIncome}
        thisMonthExpense={thisMonthExpense}
        thisMonthNet={thisMonthNet}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <CashflowChart series={cashflowSeries} />
        <BudgetProgressCard categories={categoryBudgets} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Transaksi Terakhir
            </CardTitle>
            <CardDescription className="text-xs">
              Mutasi arus kas masuk dan keluar terbaru
            </CardDescription>
          </div>
          <Link href="/transactions">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Lihat Semua</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
              Belum ada transaksi yang dicatat. Buat transaksi pertama Anda untuk melihat histori mutasi di sini.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === "income"

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card/60"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={
                            isIncome
                              ? ArrowDownLeft01Icon
                              : ArrowUpRight01Icon
                          }
                          className="h-4 w-4"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {tx.description ||
                            (isIncome ? "Pemasukan" : "Pengeluaran")}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{formatDateID(tx.transactionDate)}</span>
                          {tx.wallet && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <HugeiconsIcon
                                  icon={Wallet01Icon}
                                  className="h-3 w-3"
                                />
                                {tx.wallet.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold font-mono ${
                          isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatIDR(tx.amount)}
                      </div>
                      {tx.category && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 mt-0.5"
                        >
                          {tx.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
