import type { FilterFn } from "@tanstack/react-table"
import type { DateRangeValue } from "./types"

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export const dateRangeFilterFn: FilterFn<unknown> = (
  row,
  columnId,
  value: DateRangeValue | undefined,
) => {
  if (!value?.from && !value?.to) return true

  const raw = row.getValue(columnId)
  if (!raw) return false

  const cellDate = raw instanceof Date ? raw : new Date(String(raw))
  if (Number.isNaN(cellDate.getTime())) return false

  const from = value.from ? startOfDay(new Date(value.from)) : undefined
  const to = value.to ? endOfDay(new Date(value.to)) : undefined

  if (from && cellDate < from) return false
  if (to && cellDate > to) return false

  return true
}