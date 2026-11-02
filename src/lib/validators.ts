import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  note: z.string().optional(),
  date: z.date(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
