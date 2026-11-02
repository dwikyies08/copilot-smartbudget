"use server"

import { auth } from "@/auth"
import { getDashboardOverview } from "@/services/dashboard.service"
import type { ActionResponse, DashboardOverviewData } from "@/types"

export async function fetchDashboardOverviewAction(): Promise<
  ActionResponse<DashboardOverviewData>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const data = await getDashboardOverview(session.user.id)
    return { success: true, data }
  } catch (error) {
    console.error("[FETCH_DASHBOARD_OVERVIEW_ERROR]", error)
    return {
      success: false,
      error: "Gagal memuat ringkasan analitik dashboard",
    }
  }
}

