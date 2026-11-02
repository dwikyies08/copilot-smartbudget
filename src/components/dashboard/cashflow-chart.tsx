"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { formatIDR } from "@/lib/format"
import type { CashflowChartPoint } from "@/types"

export interface CashflowChartProps {
  series: CashflowChartPoint[]
}

export function CashflowChart({ series }: CashflowChartProps) {
  // Hitung nilai maksimum untuk proporsi tinggi bar chart SVG sederhana yang responsif
  const maxVal = Math.max(
    ...series.map((s) => Math.max(s.income, s.expense)),
    1000000
  )

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Tren Arus Kas (6 Bulan Terakhir)
        </CardTitle>
        <CardDescription className="text-xs">
          Perbandingan pendapatan (hijau) versus pengeluaran (merah)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-4 h-56 items-end border-b pb-2">
          {series.map((point, index) => {
            const incomeH = Math.max(
              Math.min(Math.round((point.income / maxVal) * 160), 160),
              4
            )
            const expenseH = Math.max(
              Math.min(Math.round((point.expense / maxVal) * 160), 160),
              4
            )

            return (
              <div
                key={index}
                className="flex flex-col items-center justify-end h-full gap-2 group"
              >
                <div className="flex items-end gap-1.5 h-full w-full justify-center">
                  {/* Income bar */}
                  <div
                    className="w-3 sm:w-4 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 relative group/bar"
                    style={{ height: `${incomeH}px` }}
                  >
                    <div className="hidden group-hover/bar:block absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                      +{formatIDR(point.income)}
                    </div>
                  </div>
                  {/* Expense bar */}
                  <div
                    className="w-3 sm:w-4 bg-destructive rounded-t-sm transition-all hover:bg-destructive/90 relative group/bar"
                    style={{ height: `${expenseH}px` }}
                  >
                    <div className="hidden group-hover/bar:block absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                      -{formatIDR(point.expense)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {point.month}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-destructive" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

