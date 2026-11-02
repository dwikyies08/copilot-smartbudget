"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { dateRangeFilterFn } from "./filter-fns"
import type { DataTableHandlers, DataTableMode, DataTableState, DataTableFilterField } from "./types"

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  state: DataTableState
  handlers: DataTableHandlers
  mode?: DataTableMode
  rowCount?: number
  pageCount?: number
  searchPlaceholder?: string
  filterFields?: DataTableFilterField[]
  dateFilterColumnId?: string
  pageSizeOptions?: number[]
  emptyText?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  state,
  handlers,
  mode = "client",
  rowCount,
  pageCount,
  searchPlaceholder,
  filterFields,
  dateFilterColumnId,
  pageSizeOptions,
  emptyText = "No results.",
}: Props<TData, TValue>) {
  const isServer = mode === "server"

  const table = useReactTable({
    data,
    columns,
    state,
    onPaginationChange: handlers.onPaginationChange,
    onSortingChange: handlers.onSortingChange,
    onColumnFiltersChange: handlers.onColumnFiltersChange,
    onGlobalFilterChange: handlers.onGlobalFilterChange,
    filterFns: {
      dateRange: dateRangeFilterFn,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
    manualPagination: isServer,
    manualFiltering: isServer,
    manualSorting: isServer,
    rowCount,
    pageCount,
    globalFilterFn: "includesString",
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        filterFields={filterFields}
        dateFilterColumnId={dateFilterColumnId}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        pageSizeOptions={pageSizeOptions}
        rowCount={rowCount}
      />
    </div>
  )
}