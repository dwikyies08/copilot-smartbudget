import { and, asc, count, desc, eq, sql, type AnyColumn } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  monthlyShoppingTemplates,
  monthlyTemplateItems,
  transactionShoppingItems,
  transactions,
  wallets,
} from "@/lib/schema"
import type {
  PaginatedResult,
  TemplateWithItems,
  CreateShoppingTemplateDTO,
  UpdateShoppingTemplateDTO,
  ShoppingTransactionDetail,
} from "@/types"

export async function getTemplatesPaginated({
  userId,
  pageIndex = 0,
  pageSize = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  userId: string
  pageIndex: number
  pageSize: number
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}): Promise<PaginatedResult<TemplateWithItems>> {
  const offset = pageIndex * pageSize
  const conditions = [eq(monthlyShoppingTemplates.userId, userId)]

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    conditions.push(
      sql`lower(${monthlyShoppingTemplates.title}) like ${searchTerm}`
    )
  }

  const whereClause = and(...conditions)

  const sortableColumns: Record<string, AnyColumn> = {
    title: monthlyShoppingTemplates.title,
    isActive: monthlyShoppingTemplates.isActive,
    createdAt: monthlyShoppingTemplates.createdAt,
  }

  const column =
    sortableColumns[sortBy] ?? monthlyShoppingTemplates.createdAt
  const order = sortOrder === "asc" ? asc(column) : desc(column)

  const [templates, total] = await Promise.all([
    db
      .select()
      .from(monthlyShoppingTemplates)
      .where(whereClause)
      .orderBy(order)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(monthlyShoppingTemplates)
      .where(whereClause),
  ])

  const rowCount = Number(total[0]?.count ?? 0)
  if (templates.length === 0) {
    return { rows: [], rowCount, pageCount: Math.ceil(rowCount / pageSize) }
  }

  const templateIds = templates.map((t) => t.id)
  const items = await db
    .select()
    .from(monthlyTemplateItems)
    .where(
      sql`${monthlyTemplateItems.templateId} in (${sql.join(
        templateIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    )

  const rows: TemplateWithItems[] = templates.map((tmpl) => {
    const tmplItems = items.filter((i) => i.templateId === tmpl.id)
    const totalEstimatedPrice = tmplItems.reduce(
      (sum, item) =>
        sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
      0
    )
    return {
      ...tmpl,
      items: tmplItems,
      itemCount: tmplItems.length,
      totalEstimatedPrice,
    }
  })

  return {
    rows,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  }
}

export async function getTemplatesByUserId(
  userId: string
): Promise<TemplateWithItems[]> {
  const templates = await db
    .select()
    .from(monthlyShoppingTemplates)
    .where(eq(monthlyShoppingTemplates.userId, userId))
    .orderBy(desc(monthlyShoppingTemplates.createdAt))

  if (templates.length === 0) return []

  const templateIds = templates.map((t) => t.id)

  const items = await db
    .select()
    .from(monthlyTemplateItems)
    .where(
      sql`${monthlyTemplateItems.templateId} in (${sql.join(
        templateIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    )

  return templates.map((tmpl) => {
    const tmplItems = items.filter((i) => i.templateId === tmpl.id)
    const totalEstimatedPrice = tmplItems.reduce(
      (sum, item) =>
        sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
      0
    )
    return {
      ...tmpl,
      items: tmplItems,
      itemCount: tmplItems.length,
      totalEstimatedPrice,
    }
  })
}

export async function getTemplateById(
  id: string,
  userId: string
): Promise<TemplateWithItems | null> {
  const [template] = await db
    .select()
    .from(monthlyShoppingTemplates)
    .where(
      and(
        eq(monthlyShoppingTemplates.id, id),
        eq(monthlyShoppingTemplates.userId, userId)
      )
    )

  if (!template) return null

  const items = await db
    .select()
    .from(monthlyTemplateItems)
    .where(eq(monthlyTemplateItems.templateId, template.id))

  const totalEstimatedPrice = items.reduce(
    (sum, item) =>
      sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
    0
  )

  return {
    ...template,
    items,
    itemCount: items.length,
    totalEstimatedPrice,
  }
}

export async function createTemplateWithItems(
  userId: string,
  data: CreateShoppingTemplateDTO
): Promise<TemplateWithItems> {
  return await db.transaction(async (tx) => {
    const [template] = await tx
      .insert(monthlyShoppingTemplates)
      .values({
        userId,
        title: data.title,
        isActive: data.isActive ?? true,
      })
      .returning()

    let items: (typeof monthlyTemplateItems.$inferSelect)[] = []

    if (data.items.length > 0) {
      items = await tx
        .insert(monthlyTemplateItems)
        .values(
          data.items.map((item) => ({
            templateId: template.id,
            productName: item.productName,
            defaultQuantity: item.defaultQuantity,
            estimatedPrice: item.estimatedPrice,
          }))
        )
        .returning()
    }

    const totalEstimatedPrice = items.reduce(
      (sum, item) =>
        sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
      0
    )

    return {
      ...template,
      items,
      itemCount: items.length,
      totalEstimatedPrice,
    }
  })
}

export async function updateTemplateWithItems(
  userId: string,
  data: UpdateShoppingTemplateDTO
): Promise<TemplateWithItems | null> {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(monthlyShoppingTemplates)
      .where(
        and(
          eq(monthlyShoppingTemplates.id, data.id),
          eq(monthlyShoppingTemplates.userId, userId)
        )
      )

    if (!existing) return null

    const [updatedTemplate] = await tx
      .update(monthlyShoppingTemplates)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      })
      .where(
        and(
          eq(monthlyShoppingTemplates.id, data.id),
          eq(monthlyShoppingTemplates.userId, userId)
        )
      )
      .returning()

    let items: (typeof monthlyTemplateItems.$inferSelect)[] = []

    if (data.items !== undefined) {
      await tx
        .delete(monthlyTemplateItems)
        .where(eq(monthlyTemplateItems.templateId, data.id))

      if (data.items.length > 0) {
        items = await tx
          .insert(monthlyTemplateItems)
          .values(
            data.items.map((item) => ({
              templateId: data.id,
              productName: item.productName,
              defaultQuantity: item.defaultQuantity,
              estimatedPrice: item.estimatedPrice,
            }))
          )
          .returning()
      }
    } else {
      items = await tx
        .select()
        .from(monthlyTemplateItems)
        .where(eq(monthlyTemplateItems.templateId, data.id))
    }

    const totalEstimatedPrice = items.reduce(
      (sum, item) =>
        sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
      0
    )

    return {
      ...updatedTemplate,
      items,
      itemCount: items.length,
      totalEstimatedPrice,
    }
  })
}

export async function deleteTemplate(
  id: string,
  userId: string
): Promise<boolean> {
  const deleted = await db
    .delete(monthlyShoppingTemplates)
    .where(
      and(
        eq(monthlyShoppingTemplates.id, id),
        eq(monthlyShoppingTemplates.userId, userId)
      )
    )
    .returning()

  return deleted.length > 0
}

export async function generateTransactionFromTemplate(
  userId: string,
  templateId: string,
  walletId: string,
  categoryId?: string | null,
  transactionDate: Date = new Date()
): Promise<ShoppingTransactionDetail> {
  return await db.transaction(async (tx) => {
    const [template] = await tx
      .select()
      .from(monthlyShoppingTemplates)
      .where(
        and(
          eq(monthlyShoppingTemplates.id, templateId),
          eq(monthlyShoppingTemplates.userId, userId)
        )
      )

    if (!template) {
      throw new Error("Template belanja tidak ditemukan")
    }

    const templateItems = await tx
      .select()
      .from(monthlyTemplateItems)
      .where(eq(monthlyTemplateItems.templateId, template.id))

    const totalEstimated = templateItems.reduce(
      (sum, item) =>
        sum + (item.estimatedPrice ?? 0) * (item.defaultQuantity ?? 1),
      0
    )

    const [createdTx] = await tx
      .insert(transactions)
      .values({
        userId,
        walletId,
        categoryId: categoryId || null,
        amount: totalEstimated,
        type: "expense",
        description: `Belanja Rutin: ${template.title}`,
        status: "completed",
        source: "shopping_list",
        transactionDate,
      })
      .returning()

    await tx
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${totalEstimated}`,
      })
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)))

    let shoppingItems: (typeof transactionShoppingItems.$inferSelect)[] = []
    if (templateItems.length > 0) {
      shoppingItems = await tx
        .insert(transactionShoppingItems)
        .values(
          templateItems.map((item) => ({
            transactionId: createdTx.id,
            productName: item.productName,
            quantity: item.defaultQuantity ?? 1,
            actualPrice: item.estimatedPrice ?? 0,
            isChecked: false,
          }))
        )
        .returning()
    }

    return {
      ...createdTx,
      items: shoppingItems,
      checkedCount: 0,
      totalItems: shoppingItems.length,
      totalActualPrice: totalEstimated,
    }
  })
}

export async function updateShoppingItemCheck(
  itemId: string,
  userId: string,
  isChecked: boolean,
  actualPrice?: number
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const [itemWithTx] = await tx
      .select({
        item: transactionShoppingItems,
        transaction: transactions,
      })
      .from(transactionShoppingItems)
      .innerJoin(
        transactions,
        eq(transactionShoppingItems.transactionId, transactions.id)
      )
      .where(
        and(
          eq(transactionShoppingItems.id, itemId),
          eq(transactions.userId, userId)
        )
      )

    if (!itemWithTx) return false

    const oldTotalItemPrice =
      (itemWithTx.item.actualPrice ?? 0) * (itemWithTx.item.quantity ?? 1)
    const newPricePerUnit = actualPrice ?? itemWithTx.item.actualPrice ?? 0
    const newTotalItemPrice = newPricePerUnit * (itemWithTx.item.quantity ?? 1)
    const priceDiff = newTotalItemPrice - oldTotalItemPrice

    await tx
      .update(transactionShoppingItems)
      .set({
        isChecked,
        ...(actualPrice !== undefined ? { actualPrice } : {}),
      })
      .where(eq(transactionShoppingItems.id, itemId))

    if (priceDiff !== 0) {
      await tx
        .update(transactions)
        .set({
          amount: sql`${transactions.amount} + ${priceDiff}`,
        })
        .where(eq(transactions.id, itemWithTx.transaction.id))

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${priceDiff}`,
        })
        .where(
          and(
            eq(wallets.id, itemWithTx.transaction.walletId),
            eq(wallets.userId, userId)
          )
        )
    }

    return true
  })
}

export async function getActiveShoppingSession(
  userId: string
): Promise<ShoppingTransactionDetail | null> {
  const [activeTx] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.source, "shopping_list")
      )
    )
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
    .limit(1)

  if (!activeTx) return null

  const items = await db
    .select()
    .from(transactionShoppingItems)
    .where(eq(transactionShoppingItems.transactionId, activeTx.id))

  const checkedCount = items.filter((i) => i.isChecked).length
  const totalActualPrice = items.reduce(
    (sum, i) => sum + (i.actualPrice ?? 0) * (i.quantity ?? 1),
    0
  )

  return {
    ...activeTx,
    items,
    checkedCount,
    totalItems: items.length,
    totalActualPrice,
  }
}
