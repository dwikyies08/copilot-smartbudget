import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  note: text("note"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  amount: real("amount").notNull(),
  month: text("month").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});
