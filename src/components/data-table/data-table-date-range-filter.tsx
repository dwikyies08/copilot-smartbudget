"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DateRangeValue = {
  from?: string
  to?: string
}

function toDateRange(value?: DateRangeValue): DateRange | undefined {
  if (!value?.from && !value?.to) return undefined

  return {
    from: value.from ? new Date(value.from) : undefined,
    to: value.to ? new Date(value.to) : undefined,
  }
}

function getLabel(value?: DateRangeValue) {
  if (value?.from && value?.to) {
    return `${format(new Date(value.from), "PPP")} - ${format(
      new Date(value.to),
      "PPP",
    )}`
  }

  if (value?.from) return format(new Date(value.from), "PPP")
  return "Pick a date range"
}

type Props = {
  value?: DateRangeValue
  onChange: (value?: DateRangeValue) => void
  className?: string
}

export function DataTableDateRangeFilter({
  value,
  onChange,
  className,
}: Props) {
  const selected = React.useMemo(() => toDateRange(value), [value])

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal md:w-[280px]"
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{getLabel(value)}</span>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              defaultMonth={selected?.from}
              selected={selected}
              onSelect={(range) => {
                if (!range?.from && !range?.to) {
                  onChange(undefined)
                  return
                }

                onChange({
                  from: range?.from?.toISOString(),
                  to: range?.to?.toISOString(),
                })
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {(value?.from || value?.to) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(undefined)}
            aria-label="Reset date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}