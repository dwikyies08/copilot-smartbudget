import type { EmailSyncLog, InsertEmailSyncLog } from "@/types"

export type EmailSyncStatus = "synced" | "processing" | "failed"

export type EmailSyncSummary = {
  totalSyncedEmails: number
  lastSyncedAt?: Date | null
  recentLogs: EmailSyncLog[]
}

export type RecordEmailSyncDTO = Omit<
  InsertEmailSyncLog,
  "id" | "userId" | "processedAt"
>
