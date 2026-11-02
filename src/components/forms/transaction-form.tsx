"use client";

import { submitTransaction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TransactionForm({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <form action={submitTransaction} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Judul transaksi</label>
        <Input name="title" placeholder="Gaji, belanja, dll" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Jumlah</label>
        <Input type="number" name="amount" placeholder="2500000" min={0} step={1000} />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Jenis</label>
        <select name="type" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50">
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Kategori</label>
        <select name="categoryId" className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Tanggal</label>
        <Input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Catatan</label>
        <Input name="note" placeholder="Opsional" />
      </div>

      <Button type="submit" className="w-full">
        Simpan transaksi
      </Button>
    </form>
  );
}
