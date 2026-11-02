"use client"

import type { ReactNode } from "react"
import { create } from "zustand"

type ConfirmOptions = {
  title?: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
}

type ConfirmState = {
  open: boolean
  options: ConfirmOptions
  resolver: ((value: boolean) => void) | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  onConfirm: () => void
  onCancel: () => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: {},
  resolver: null,

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        options,
        resolver: resolve,
      })
    }),

  onConfirm: () => {
    const resolver = get().resolver
    resolver?.(true)

    set({
      open: false,
      options: {},
      resolver: null,
    })
  },

  onCancel: () => {
    const resolver = get().resolver
    resolver?.(false)

    set({
      open: false,
      options: {},
      resolver: null,
    })
  },
}))