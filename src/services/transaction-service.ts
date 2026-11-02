import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";

export type CreateTransactionInput = {
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  note?: string;
  date: Date;
};

export async function getRecentTransactions(limit = 6) {
  return db.select().from(transactions).orderBy(desc(transactions.date)).limit(limit);
}

export async function getTransactionSummary() {
  const rows = await db.select().from(transactions);

  const income = rows
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expense = rows
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getCategories() {
  return db.select().from(categories);
}

export async function createTransaction(input: CreateTransactionInput) {
  const title = input.title.trim();
  const amount = Number(input.amount);

  if (!title) {
    throw new Error("Judul transaksi wajib diisi.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Jumlah harus berupa angka yang valid dan lebih besar dari 0.");
  }

  if (!input.categoryId) {
    throw new Error("Kategori harus dipilih.");
  }

  await db.insert(transactions).values({
    id: randomUUID(),
    title,
    amount,
    type: input.type,
    categoryId: input.categoryId,
    note: input.note?.trim() || null,
    date: input.date,
    createdAt: new Date(),
  });
}
