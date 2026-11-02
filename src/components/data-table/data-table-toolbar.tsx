"use client"

import type { Table } from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DataTableDateRangeFilter } from "./data-table-date-range-filter"
import type { DataTableFilterField, DateRangeValue } from "./types"

type Props<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  filterFields?: DataTableFilterField[]
  dateFilterColumnId?: string
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  filterFields = [],
  dateFilterColumnId,
}: Props<TData>) {
  const isFiltered =
    !!table.getState().globalFilter || table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full md:max-w-sm"
        />

        {filterFields.map((field) => {
          const column = table.getColumn(field.columnId)
          if (!column) return null

          if (field.type === "select") {
            return (
              <Select
                key={field.columnId}
                value={(column.getFilterValue() as string) ?? "all"}
                onValueChange={(value) =>
                  column.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={field.title} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {field.title}</SelectItem>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }

          return (
            <Input
              key={field.columnId}
              placeholder={field.placeholder ?? field.title}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="w-full md:w-[180px]"
            />
          )
        })}

        {dateFilterColumnId && table.getColumn(dateFilterColumnId) ? (
          <DataTableDateRangeFilter
            value={
              table.getColumn(dateFilterColumnId)?.getFilterValue() as
                | DateRangeValue
                | undefined
            }
            onChange={(value) =>
              table.getColumn(dateFilterColumnId)?.setFilterValue(value)
            }
          />
        ) : null}
      </div>

      {isFiltered ? (
        <Button
          variant="outline"
          onClick={() => {
            table.resetColumnFilters()
            table.setGlobalFilter("")
          }}
        >
          Reset
        </Button>
      ) : null}
    </div>
  )
}