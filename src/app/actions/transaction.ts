"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export async function createTransaction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const type = String(formData.get("type") ?? "expense");
  const categoryId = String(formData.get("categoryId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const dateValue = String(formData.get("date") ?? new Date().toISOString().slice(0, 10));

  if (!title || !amount || !categoryId) {
    throw new Error("Judul, jumlah, dan kategori wajib diisi.");
  }

  await db.insert(transactions).values({
    id: randomUUID(),
    title,
    amount,
    type,
    categoryId,
    note,
    date: new Date(dateValue),
    createdAt: new Date(),
  });

  revalidatePath("/");
}
