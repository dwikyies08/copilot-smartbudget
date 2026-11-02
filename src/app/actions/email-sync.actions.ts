"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  recordEmailSyncSchema,
  queryEmailSyncLogsSchema,
  formatZodErrors,
} from "@/validations"
import {
  getEmailSyncLogs,
  getEmailSyncSummary,
  recordEmailSyncTransaction,
} from "@/services/email-sync.service"
import type {
  ActionResponse,
  EmailSyncLog,
  EmailSyncSummary,
} from "@/types"

export async function fetchEmailSyncSummaryAction(): Promise<
  ActionResponse<EmailSyncSummary>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const summary = await getEmailSyncSummary(session.user.id)
    return { success: true, data: summary }
  } catch (error) {
    console.error("[FETCH_EMAIL_SYNC_SUMMARY_ERROR]", error)
    return { success: false, error: "Gagal memuat status sinkronisasi email" }
  }
}

export async function recordEmailSyncAction(
  input: unknown
): Promise<ActionResponse<EmailSyncLog>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const parsed = recordEmailSyncSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: "Data log email tidak valid",
        fieldErrors: formatZodErrors(parsed.error),
      }
    }

    const created = await recordEmailSyncTransaction(
      session.user.id,
      parsed.data
    )

    revalidatePath("/insights")

    return {
      success: true,
      message: "Log sinkronisasi email berhasil dicatat",
      data: created,
    }
  } catch (error) {
    console.error("[RECORD_EMAIL_SYNC_ERROR]", error)
    return { success: false, error: "Gagal mencatat log email sync" }
  }
}

