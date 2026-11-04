"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Wallet01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { formatIDR } from "@/lib/format"

export interface SummaryCardsProps {
  totalBalance: number
  walletCount: number
  thisMonthIncome: number
  thisMonthExpense: number
  thisMonthNet: number
}

export function SummaryCards({
  totalBalance,
  walletCount,
  thisMonthIncome,
  thisMonthExpense,
  thisMonthNet,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="surface-sky">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Kekayaan Saldo
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <HugeiconsIcon icon={Wallet01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold amount-neutral">{formatIDR(totalBalance)}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dari total {walletCount} dompet &amp; rekening
          </p>
        </CardContent>
      </Card>

      <Card className="surface-emerald">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pemasukan Bulan Ini
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HugeiconsIcon icon={ArrowDownLeft01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold amount-income">
            {formatIDR(thisMonthIncome)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Arus kas masuk bulan berjalan
          </p>
        </CardContent>
      </Card>

      <Card className="surface-rose">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pengeluaran Bulan Ini
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold amount-expense">
            {formatIDR(thisMonthExpense)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Arus kas keluar belanja &amp; tagihan
          </p>
        </CardContent>
      </Card>

      <Card className="surface-indigo">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Surplus / Defisit (Net)
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <HugeiconsIcon icon={Coins01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-xl font-bold ${
              thisMonthNet >= 0 ? "amount-income" : "amount-expense"
            }`}
          >
            {formatIDR(thisMonthNet)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tabungan bersih periode ini
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

