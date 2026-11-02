import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { emailSyncLogs } from "@/lib/schema"
import type { EmailSyncLog } from "@/types"
import type {
  EmailSyncSummary,
  RecordEmailSyncDTO,
} from "@/types/email-sync.types"

export async function getEmailSyncLogs(
  userId: string,
  limit: number = 10
): Promise<EmailSyncLog[]> {
  return await db
    .select()
    .from(emailSyncLogs)
    .where(eq(emailSyncLogs.userId, userId))
    .orderBy(desc(emailSyncLogs.processedAt))
    .limit(limit)
}

export async function getEmailSyncSummary(
  userId: string
): Promise<EmailSyncSummary> {
  const logs = await getEmailSyncLogs(userId, 5)

  const countResult = await db
    .select({ count: sql<number>`count(${emailSyncLogs.id})` })
    .from(emailSyncLogs)
    .where(eq(emailSyncLogs.userId, userId))

  const totalSyncedEmails = Number(countResult[0]?.count ?? 0)
  const lastSyncedAt = logs[0]?.processedAt ?? null

  return {
    totalSyncedEmails,
    lastSyncedAt,
    recentLogs: logs,
  }
}

export async function recordEmailSyncTransaction(
  userId: string,
  data: RecordEmailSyncDTO
): Promise<EmailSyncLog> {
  const [created] = await db
    .insert(emailSyncLogs)
    .values({
      ...data,
      userId,
      processedAt: new Date(),
    })
    .returning()

  return created
}

