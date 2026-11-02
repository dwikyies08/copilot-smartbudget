"use client"

import { useConfirmStore } from "@/hooks/use-confirm-store"

export function useConfirm() {
  return useConfirmStore((state) => state.confirm)
}