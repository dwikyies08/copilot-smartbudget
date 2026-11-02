import { formatCurrency, formatDate } from "@/lib/format";

export function RecentTransactionsList({
  transactions,
}: {
  transactions: Array<{
    id: string;
    title: string;
    amount: number;
    type: "income" | "expense";
    date: Date;
    note: string | null;
  }>;
}) {
  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada transaksi.</p>
      ) : (
        transactions.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
            <div>
              <p className="font-medium text-white">{item.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>{formatDate(item.date)}</span>
                {item.note ? <span>•</span> : null}
                {item.note ? <span>{item.note}</span> : null}
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                {item.type === "income" ? "+" : "-"} {formatCurrency(Number(item.amount))}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
