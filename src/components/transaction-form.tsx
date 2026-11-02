"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTransaction } from "@/app/actions/transaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export function TransactionForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setError(null);
      await createTransaction(formData);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle>Tambah transaksi</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Judul</label>
            <Input name="title" placeholder="Gaji, belanja, dll" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Jumlah</label>
            <Input type="number" name="amount" min="0" step="1000" placeholder="2500000" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tipe</label>
              <select
                name="type"
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
                defaultValue="expense"
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Kategori</label>
              <select
                name="categoryId"
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50"
                defaultValue={categories[0]?.id ?? ""}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Tanggal</label>
            <Input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Catatan</label>
            <Input name="note" placeholder="Opsional" />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <Button type="submit" className="w-full">
            Simpan transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
