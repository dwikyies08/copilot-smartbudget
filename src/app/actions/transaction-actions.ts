"use server";

import { revalidatePath } from "next/cache";
import { createTransaction } from "@/services/transaction-service";

export async function submitTransaction(formData: FormData) {
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    amount: Number(formData.get("amount") ?? 0),
    type: (String(formData.get("type") ?? "expense") as "income" | "expense"),
    categoryId: String(formData.get("categoryId") ?? ""),
    note: String(formData.get("note") ?? ""),
    date: new Date(String(formData.get("date") ?? new Date())),
  };

  await createTransaction(payload);
  revalidatePath("/");
  revalidatePath("/dashboard");
}
