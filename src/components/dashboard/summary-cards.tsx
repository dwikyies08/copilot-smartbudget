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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Kekayaan Saldo
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Wallet01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-heading">{formatIDR(totalBalance)}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Dari total {walletCount} dompet &amp; rekening
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pemasukan Bulan Ini
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <HugeiconsIcon icon={ArrowDownLeft01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {formatIDR(thisMonthIncome)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Arus kas masuk bulan berjalan
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Pengeluaran Bulan Ini
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold font-heading">
            {formatIDR(thisMonthExpense)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Arus kas keluar belanja &amp; tagihan
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Surplus / Defisit (Net)
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={Coins01Icon} className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-xl font-bold font-heading ${
              thisMonthNet >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
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

