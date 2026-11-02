// lib/schema.ts
import {
  sqliteTable,
  real,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core"
import type { AdapterAccountType } from "next-auth/adapters"
import { relations, sql } from "drizzle-orm"

export const users = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(), // Menambahkan unique() agar email tidak ganda
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  password: text("password"),
  role: text("role").notNull().default("user"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).$defaultFn(() => new Date()), // Tambahan untuk Smart Budget
});

export const accounts = sqliteTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}, (verificationToken) => [
  primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
]);

// ==========================================
// 2. SCHEMA SMART BUDGET
// ==========================================

export const wallets = sqliteTable("wallet", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  balance: real("balance").default(0.0),
  currency: text("currency").default("IDR"),
});

export const categories = sqliteTable("category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(), // Drizzle Enum untuk SQLite
  budgetLimit: real("budgetLimit").default(0.0),
});

export const transactions = sqliteTable("transaction", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: text("walletId").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  categoryId: text("categoryId").references(() => categories.id, { onDelete: "set null" }),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  description: text("description"),
  referenceCode: text("referenceCode").unique(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending"),
  source: text("source", { enum: ["manual", "email_sync", "shopping_list"] }).default("manual"),
  transactionDate: integer("transactionDate", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

export const emailSyncLogs = sqliteTable("email_sync_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailMessageId: text("emailMessageId").notNull().unique(),
  sender: text("sender").notNull(),
  receivedAt: integer("receivedAt", { mode: "timestamp_ms" }).notNull(),
  processedAt: integer("processedAt", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

// ==========================================
// 3. SCHEMA TEMPLATE & BELANJA BULANAN
// ==========================================

export const monthlyShoppingTemplates = sqliteTable("monthly_shopping_template", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isActive: integer("isActive", { mode: "boolean" }).default(true), // SQLite Boolean
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

export const monthlyTemplateItems = sqliteTable("monthly_template_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  templateId: text("templateId").notNull().references(() => monthlyShoppingTemplates.id, { onDelete: "cascade" }),
  productName: text("productName").notNull(),
  defaultQuantity: integer("defaultQuantity").default(1),
  estimatedPrice: real("estimatedPrice").default(0.0),
});

export const transactionShoppingItems = sqliteTable("transaction_shopping_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  transactionId: text("transactionId").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  productName: text("productName").notNull(),
  quantity: integer("quantity").default(1),
  actualPrice: real("actualPrice").default(0.0),
  isChecked: integer("isChecked", { mode: "boolean" }).default(false), // Otomatis menjadi boolean di TypeScript
});

export const budgetPredictions = sqliteTable("budget_prediction", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productName: text("productName").notNull(),
  averagePrice: real("averagePrice").default(0.0),
  predictedNextPrice: real("predictedNextPrice").default(0.0),
  recommendedQuantity: integer("recommendedQuantity").default(1),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});