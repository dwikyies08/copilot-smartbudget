import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transaction-form";

const defaultCategories = [
  { id: "salary", name: "Gaji", type: "income" },
  { id: "freelance", name: "Freelance", type: "income" },
  { id: "food", name: "Makanan", type: "expense" },
  { id: "transport", name: "Transport", type: "expense" },
  { id: "housing", name: "Rumah", type: "expense" },
  { id: "shopping", name: "Belanja", type: "expense" },
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function Home() {
  const categoryList = (await db.select().from(categories)).length
    ? await db.select().from(categories)
    : defaultCategories.map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
        createdAt: new Date(),
      }));

  const allTransactions = await db.select().from(transactions);

  const income = allTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expense = allTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expense;

  const recent = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(6);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">SmartBudget</p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h1>
          </div>

          <Button variant="outline" asChild>
            <Link href="/reports">Lihat laporan</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(income)}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">{formatCurrency(expense)}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-sky-400" : "text-amber-400"}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <CardTitle>Transaksi terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recent.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada transaksi.</p>
              ) : (
                recent.map((item) => {
                  const category = categoryList.find((cat) => cat.id === item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3"
                    >
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span>{category?.name ?? "Uncategorized"}</span>
                          <span>•</span>
                          <span>{new Date(item.date).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                          {item.type === "income" ? "+" : "-"} {formatCurrency(Number(item.amount))}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <TransactionForm categories={categoryList} />
        </div>
      </div>
    </main>
  );
}
