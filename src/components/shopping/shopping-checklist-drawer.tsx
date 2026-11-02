"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  ShoppingCart01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { toggleShoppingItemAction } from "@/app/actions/shopping.actions"
import { formatIDR } from "@/lib/format"
import type { ShoppingTransactionDetail } from "@/types"

export interface ShoppingChecklistDrawerProps {
  activeSession: ShoppingTransactionDetail | null
}

export function ShoppingChecklistDrawer({
  activeSession,
}: ShoppingChecklistDrawerProps) {
  const [isPending, startTransition] = React.useTransition()
  const [priceOverrides, setPriceOverrides] = React.useState<
    Record<string, number>
  >({})

  if (!activeSession || activeSession.items.length === 0) {
    return null
  }

  const { items, checkedCount, totalItems, totalActualPrice, description } =
    activeSession
  const progress =
    totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  const handleToggle = (
    itemId: string,
    currentCheck: boolean,
    currentPrice: number
  ) => {
    const nextCheck = !currentCheck
    const overridePrice = priceOverrides[itemId] ?? currentPrice

    startTransition(async () => {
      const res = await toggleShoppingItemAction({
        itemId,
        isChecked: nextCheck,
        actualPrice: overridePrice,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui status item")
        return
      }

      toast.success(
        nextCheck
          ? "Barang ditandai selesai dibeli"
          : "Tanda beli dibatalkan"
      )
    })
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-base font-bold">
                {description || "Sesi Belanja Aktif"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Centang barang yang telah Anda masukkan ke keranjang belanja nyata
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold text-xs">
              {checkedCount} / {totalItems} Selesai ({progress}%)
            </Badge>
            <Badge variant="outline" className="font-bold text-xs">
              Total: {formatIDR(totalActualPrice)}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = Boolean(item.isChecked)
            const itemPrice = item.actualPrice ?? 0

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  isChecked
                    ? "bg-background/40 border-muted opacity-70 line-through"
                    : "bg-background border-border shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={isChecked ? "default" : "outline"}
                    size="sm"
                    className={`h-7 w-7 rounded-md p-0 ${
                      isChecked
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : ""
                    }`}
                    onClick={() =>
                      handleToggle(item.id, isChecked, itemPrice)
                    }
                    disabled={isPending}
                  >
                    {isChecked ? (
                      <HugeiconsIcon icon={Tick02Icon} className="h-4 w-4" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full border border-primary/50" />
                    )}
                  </Button>
                  <div>
                    <div className="text-sm font-medium">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Jumlah: {item.quantity ?? 1} unit
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-semibold">
                      {formatIDR(itemPrice * (item.quantity ?? 1))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      @{formatIDR(itemPrice)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

