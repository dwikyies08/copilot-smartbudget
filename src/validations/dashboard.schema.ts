import * as z from "zod"

export const dashboardPeriodSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2050).default(() => new Date().getFullYear()),
  month: z.coerce.number().int().min(1).max(12).optional(),
})

export type DashboardPeriodInput = z.infer<typeof dashboardPeriodSchema>

