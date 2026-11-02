"use client"

import * as React from "react"
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table"
import type { DataTableState } from "@/components/data-table/types"

export type UseDataTableStateOptions = {
  initialPageSize?: number
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
  initialGlobalFilter?: string
}

function resolveUpdater<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(prev)
    : updater
}

export function useDataTableState(
  options: UseDataTableStateOptions = {},
): DataTableState & {
  setPagination: (updater: Updater<PaginationState>) => void
  setSorting: (updater: Updater<SortingState>) => void
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void
  setGlobalFilter: (value: string) => void
  resetTable: () => void
} {
  const [pagination, setPaginationState] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: options.initialPageSize ?? 10,
  })
  const [sorting, setSortingState] = React.useState<SortingState>(
    options.initialSorting ?? [],
  )
  const [columnFilters, setColumnFiltersState] =
    React.useState<ColumnFiltersState>(options.initialColumnFilters ?? [])
  const [globalFilter, setGlobalFilter] = React.useState(
    options.initialGlobalFilter ?? "",
  )

  const setPagination = React.useCallback((updater: Updater<PaginationState>) => {
    setPaginationState((prev) => resolveUpdater(updater, prev))
  }, [])

  const setSorting = React.useCallback((updater: Updater<SortingState>) => {
    setSortingState((prev) => {
      const next = resolveUpdater(updater, prev)
      return next
    })
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const setColumnFilters = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      setColumnFiltersState((prev) => {
        const next = resolveUpdater(updater, prev)
        return next
      })
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
    },
    [],
  )

  const updateGlobalFilter = React.useCallback((value: string) => {
    setGlobalFilter(value)
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const resetTable = React.useCallback(() => {
    setPaginationState({ pageIndex: 0, pageSize: options.initialPageSize ?? 10 })
    setSortingState(options.initialSorting ?? [])
    setColumnFiltersState(options.initialColumnFilters ?? [])
    setGlobalFilter(options.initialGlobalFilter ?? "")
  }, [
    options.initialColumnFilters,
    options.initialGlobalFilter,
    options.initialPageSize,
    options.initialSorting,
  ])

  return {
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    setPagination,
    setSorting,
    setColumnFilters,
    setGlobalFilter: updateGlobalFilter,
    resetTable,
  }
}