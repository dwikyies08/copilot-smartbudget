import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"

export type DataTableMode = "client" | "server"

export type DateRangeValue = {
  from?: string
  to?: string
}

export type DataTableFilterOption = {
  label: string
  value: string
}

export type DataTableFilterField = {
  columnId: string
  title: string
  type?: "text" | "select"
  placeholder?: string
  options?: DataTableFilterOption[]
}

export type DataTableState = {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}

export type DataTableHandlers = {
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  onGlobalFilterChange: (value: string) => void
}