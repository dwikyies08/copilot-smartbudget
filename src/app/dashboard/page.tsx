import { getCategories, getRecentTransactions, getTransactionSummary } from "@/services/transaction-service";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions";
import { TransactionForm } from "@/components/forms/transaction-form";

export default async function DashboardPage() {
  const [summary, transactions, categories] = await Promise.all([
    getTransactionSummary(),
    getRecentTransactions(8),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-slate-400">SmartBudget</p>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <SummaryCards income={summary.income} expense={summary.expense} balance={summary.balance} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-semibold">Daftar transaksi</h2>
          <RecentTransactionsList transactions={transactions} />
        </section>

        <TransactionForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
      </div>
    </main>
  );
}
