import * as z from "zod"

export const recordEmailSyncSchema = z.object({
  emailMessageId: z.string().min(1, "ID pesan email wajib diisi"),
  sender: z.string().email("Format email pengirim tidak valid"),
  receivedAt: z.coerce.date().default(() => new Date()),
})

export const queryEmailSyncLogsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type RecordEmailSyncInput = z.infer<typeof recordEmailSyncSchema>
export type QueryEmailSyncLogsInput = z.infer<typeof queryEmailSyncLogsSchema>

