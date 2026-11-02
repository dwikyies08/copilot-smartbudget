"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export interface Option {
  value: string
  label: string
}

interface AsyncComboboxProps {
  value?: string
  onChange: (value: string) => void
  fetcher: (params: { pageIndex: number; search: string }) => Promise<{
    data: Option[]
    pageCount: number
  }>
  placeholder?: string
  emptyText?: string
}

export function AsyncCombobox({
  value,
  onChange,
  fetcher,
  placeholder = "Cari item...",
  emptyText = "Data tidak ditemukan.",
}: AsyncComboboxProps) {
  const [items, setItems] = React.useState<Option[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(true)

  const loadData = async (
    currentPage: number,
    currentSearch: string,
    isAppending = false
  ) => {
    setLoading(true)
    try {
      const result = await fetcher({
        pageIndex: currentPage,
        search: currentSearch,
      })

      if (isAppending) {
        setItems((prev) => [...prev, ...result.data])
      } else {
        setItems(result.data)
      }

      setHasMore(currentPage < result.pageCount)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (selectedValue: string) => {
    // 1. Kirim ID yang dipilih ke form (parent)
    onChange(selectedValue)

    // 2. Cari data pasien yang dipilih dari daftar items saat ini
    if (selectedValue) {
      const selectedItem = items.find((item) => item.value === selectedValue)
      if (selectedItem) {
        // 3. Ganti tulisan "a" menjadi nama lengkap pasien
        setSearch(selectedItem.label)
      }
    } else {
      setSearch("") // Kosongkan text jika pilihan di-clear
    }
  }

  // Debounce untuk menangkap ketikan user
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadData(1, search, false)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Fungsi Infinite Scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10

    if (isBottom && !loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadData(nextPage, search, true)
    }
  }

  return (
    <Combobox items={items} value={value} onValueChange={handleSelect}>
      <ComboboxInput
        placeholder={placeholder}
        value={search}
        // Gunakan onChange atau onValueChange tergantung API dari komponen UI Anda
        onChange={(e) => setSearch(e.target.value)}
      />

      <ComboboxContent>
        {items.length === 0 && !loading && (
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        )}

        {/* Menyisipkan onScroll langsung ke list untuk memantau pergerakan ke bawah */}
        <ComboboxList
          onScroll={handleScroll}
          className="max-h-[250px] overflow-y-auto"
        >
          {(item: Option) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>

        {/* Indikator Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Memuat...
            </span>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
