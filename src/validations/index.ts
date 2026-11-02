import * as z from "zod"

// ==========================================
// 1. SHARED / COMMON ZOD VALIDATION SCHEMAS
// ==========================================

export const idParamSchema = z.object({
  id: z.string().min(1, "ID wajib diisi"),
})

export const paginationQuerySchema = z.object({
  pageIndex: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  from: z.string().optional(),
  to: z.string().optional(),
})

export type IdParamInput = z.infer<typeof idParamSchema>
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>

/**
 * Helper untuk memformat error Zod menjadi object fieldErrors yang ringkas
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const pathKey = issue.path.join(".") || "root"
    if (!fieldErrors[pathKey]) {
      fieldErrors[pathKey] = []
    }
    fieldErrors[pathKey].push(issue.message)
  }
  return fieldErrors
}

export * from "./auth.schema"
export * from "./wallet.schema"
export * from "./category.schema"
export * from "./transaction.schema"
export * from "./shopping.schema"
export * from "./prediction.schema"
export * from "./email-sync.schema"
export * from "./dashboard.schema"

