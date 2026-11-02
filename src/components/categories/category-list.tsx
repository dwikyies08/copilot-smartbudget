"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  Edit01Icon,
  Delete01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
import { deleteCategoryAction } from "@/app/actions/category.actions"
import { formatIDR } from "@/lib/format"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import type { CategoryWithUsage } from "@/types"

export interface CategoryListProps {
  categories: CategoryWithUsage[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [isDeleting, startDeleteTransition] = React.useTransition()
  const [selectedDeleteId, setSelectedDeleteId] = React.useState<string | null>(null)

  const handleDelete = (id: string) => {
    startDeleteTransition(async () => {
      const res = await deleteCategoryAction(id)
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus kategori")
        return
      }
      toast.success(res.message || "Kategori berhasil dihapus")
      setSelectedDeleteId(null)
    })
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <HugeiconsIcon icon={Folder01Icon} className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Belum Ada Kategori</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          Buat kategori pemasukan atau pengeluaran pertama Anda untuk mengelompokkan transaksi dan memantau anggaran.
        </p>
        <CategoryFormDialog />
      </div>
    )
  }

  const expenseCategories = categories.filter((c) => c.type === "expense")
  const incomeCategories = categories.filter((c) => c.type === "income")

  return (
    <div className="space-y-8">
      {/* Pengeluaran */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Kategori Pengeluaran</h3>
            <p className="text-xs text-muted-foreground">
              Dilengkapi pelacakan batas anggaran bulanan
            </p>
          </div>
          <Badge variant="outline">{expenseCategories.length} Kategori</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCategories.map((category) => {
            const hasLimit = (category.budgetLimit ?? 0) > 0
            const percentage = category.percentageUsed ?? 0
            const isOver = category.isOverBudget

            return (
              <Card
                key={category.id}
                className="flex flex-col justify-between transition-shadow hover:shadow-xs"
              >
                <div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {category.name}
                      </CardTitle>
                      <CardDescription>
                        {category.transactionCount ?? 0} transaksi bulan ini
                      </CardDescription>
                    </div>
                    <Badge variant="destructive" className="capitalize text-[10px]">
                      Pengeluaran
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Realisasi Bulan Ini</div>
                      <div className="text-xl font-bold">
                        {formatIDR(category.totalSpent ?? 0)}
                      </div>
                    </div>

                    {hasLimit ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Limit: {formatIDR(category.budgetLimit ?? 0)}
                          </span>
                          <span
                            className={
                              isOver
                                ? "font-semibold text-destructive flex items-center gap-1"
                                : "text-muted-foreground"
                            }
                          >
                            {isOver && (
                              <HugeiconsIcon
                                icon={AlertCircleIcon}
                                className="h-3 w-3 inline text-destructive"
                              />
                            )}
                            {percentage}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={isOver ? "[&>div]:bg-destructive" : ""}
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        Tanpa batas anggaran
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="flex items-center justify-end gap-2 border-t pt-3">
                  <CategoryFormDialog
                    category={category}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2.5">
                        <HugeiconsIcon icon={Edit01Icon} className="h-3.5 w-3.5" />
                        <span className="text-xs">Ubah</span>
                      </Button>
                    }
                  />

                  <AlertDialog
                    open={selectedDeleteId === category.id}
                    onOpenChange={(open) =>
                      setSelectedDeleteId(open ? category.id : null)
                    }
                  >
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="h-3.5 w-3.5" />
                          <span className="text-xs">Hapus</span>
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kategori "{category.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Transaksi yang terkait
                          dengan kategori ini akan kehilangan kaitannya (menjadi tanpa kategori).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            handleDelete(category.id)
                          }}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pemasukan */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Kategori Pemasukan</h3>
            <p className="text-xs text-muted-foreground">
              Sumber pendapatan dan arus kas masuk
            </p>
          </div>
          <Badge variant="outline">{incomeCategories.length} Kategori</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {incomeCategories.map((category) => (
            <Card
              key={category.id}
              className="flex flex-col justify-between transition-shadow hover:shadow-xs"
            >
              <div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">
                    {category.name}
                  </CardTitle>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    Pemasukan
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">Total Diterima</div>
                  <div className="text-xl font-bold">
                    {formatIDR(category.totalSpent ?? 0)}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="flex items-center justify-end gap-2 border-t pt-3">
                <CategoryFormDialog
                  category={category}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2.5">
                      <HugeiconsIcon icon={Edit01Icon} className="h-3.5 w-3.5" />
                      <span className="text-xs">Ubah</span>
                    </Button>
                  }
                />

                <AlertDialog
                  open={selectedDeleteId === category.id}
                  onOpenChange={(open) =>
                    setSelectedDeleteId(open ? category.id : null)
                  }
                >
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="h-3.5 w-3.5" />
                        <span className="text-xs">Hapus</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Kategori "{category.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Transaksi yang terkait
                        akan tetap ada tetapi tanpa kategori.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(category.id)
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

