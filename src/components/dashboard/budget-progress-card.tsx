"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Tag01Icon } from "@hugeicons/core-free-icons"
import { formatIDR } from "@/lib/format"
import type { CategoryBudgetStatus } from "@/types"

export interface BudgetProgressCardProps {
  categories: CategoryBudgetStatus[]
}

export function BudgetProgressCard({ categories }: BudgetProgressCardProps) {
  // Hanya ambil kategori pengeluaran yang memiliki limit anggaran
  const limitedCategories = categories.filter((c) => c.budgetLimit > 0)

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4 text-primary" />
            Batas Anggaran Kategori
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {limitedCategories.length} Kategori
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Pemakaian batas anggaran bulanan berjalan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {limitedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
            Belum ada kategori yang memiliki limit anggaran bulanan. Atur limit di menu Kategori.
          </div>
        ) : (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {limitedCategories.map((c) => (
              <div key={c.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate max-w-[120px]">
                    {c.categoryName}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-muted-foreground">
                      {formatIDR(c.totalSpent)} / {formatIDR(c.budgetLimit)}
                    </span>
                    <span
                      className={`font-semibold ${
                        c.isOverBudget ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      ({c.percentageUsed}%)
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.min(c.percentageUsed, 100)}
                  className={`h-2 ${c.isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

