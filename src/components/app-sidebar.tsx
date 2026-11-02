"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Folder01Icon,
  Settings05Icon,
  HelpCircleIcon,
  Invoice01Icon,
  Wallet01Icon,
  ShoppingCart01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navMain = [
    {
      title: "Dashboard Keuangan",
      url: "/dashboard",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Dompet & Akun",
      url: "/wallets",
      icon: <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} />,
    },
    {
      title: "Kategori & Anggaran",
      url: "/categories",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
    {
      title: "Riwayat Transaksi",
      url: "/transactions",
      icon: <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />,
    },
    {
      title: "Belanja Bulanan",
      url: "/shopping",
      icon: <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />,
    },
    {
      title: "Smart Insights & AI",
      url: "/insights",
      icon: <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />,
    },
  ]

  const secondaryNav = [
    {
      title: "Pengaturan Sistem",
      url: "/settings",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    },
    {
      title: "Pusat Bantuan",
      url: "/help",
      icon: <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />,
    },
  ]

  const userData = {
    name: user?.name || "Pengguna Smart Budget",
    email: user?.email || "",
    avatar: user?.image || "",
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Smart Budget"
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Akasanastark"

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <div className="rounded-md bg-primary/10 p-1 text-primary">
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  strokeWidth={2}
                  className="size-5!"
                />
              </div>
              <div className="ml-1 flex flex-col gap-0.5">
                <span className="text-base leading-none font-bold tracking-tight">
                  {appName}
                </span>
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
                  Personal Finance &amp; AI
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={secondaryNav} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t border-border/40 px-4 py-2 text-center font-mono text-[10px] text-muted-foreground/50">
          Future by {companyName}
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
