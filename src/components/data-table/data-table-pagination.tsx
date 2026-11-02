"use client"

import type { Table } from "@tanstack/react-table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props<TData> = {
  table: Table<TData>
  pageSizeOptions?: number[]
  rowCount?: number
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 50, 100],
  rowCount,
}: Props<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const currentRows = table.getRowModel().rows.length
  const totalRows = rowCount ?? table.getFilteredRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = totalRows === 0 ? 0 : pageIndex * pageSize + currentRows

  const createPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []

    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }
      return pages
    }

    pages.push(0)

    if (pageIndex > 2) {
      pages.push("ellipsis")
    }

    const startPage = Math.max(1, pageIndex - 1)
    const endPage = Math.min(pageCount - 2, pageIndex + 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (pageIndex < pageCount - 3) {
      pages.push("ellipsis")
    }

    pages.push(pageCount - 1)

    return pages
  }

  const pages = createPageNumbers()

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalRows} row(s)
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  table.previousPage()
                }}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={pageIndex === page}
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(page)
                    }}
                  >
                    {page + 1}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  table.nextPage()
                }}
                className={
                  !table.getCanNextPage()
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}