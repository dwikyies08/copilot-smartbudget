import Link from "next/link";
import { getCategories, getRecentTransactions, getTransactionSummary } from "@/services/transaction-service";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions";
import { TransactionForm } from "@/components/forms/transaction-form";

export default async function HomePage() {
  const [summary, recentTransactions, categories] = await Promise.all([
    getTransactionSummary(),
    getRecentTransactions(6),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">SmartBudget</p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h1>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
          >
            Lihat dashboard
          </Link>
        </div>

        <SummaryCards
          income={summary.income}
          expense={summary.expense}
          balance={summary.balance}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-semibold">Transaksi terbaru</h2>
            <RecentTransactionsList transactions={recentTransactions} />
          </section>

          <TransactionForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
        </div>
      </div>
    </main>
  );
}
