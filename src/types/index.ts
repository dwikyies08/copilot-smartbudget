export type TransactionType = "income" | "expense";

export type TransactionRecord = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string | null;
  date: Date;
  createdAt: Date;
};

export type CategoryRecord = {
  id: string;
  name: string;
  type: TransactionType;
  createdAt: Date;
};
