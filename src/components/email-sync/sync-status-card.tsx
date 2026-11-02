"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { formatDateID } from "@/lib/format"
import type { EmailSyncSummary } from "@/types"

export interface SyncStatusCardProps {
  summary: EmailSyncSummary
}

export function SyncStatusCard({ summary }: SyncStatusCardProps) {
  const { totalSyncedEmails, lastSyncedAt, recentLogs } = summary

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 text-primary" />
            Integrasi Bukti Transaksi Email
          </CardTitle>
          <CardDescription>
            Sinkronisasi otomatis e-receipt / struk digital perbankan dan e-wallet
          </CardDescription>
        </div>
        <Badge variant="outline" className="gap-1 font-normal text-xs text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3" />
          Aktif
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-3">
          <div>
            <div className="text-xs text-muted-foreground">Total Email Terekam</div>
            <div className="text-xl font-bold">{totalSyncedEmails} E-Receipt</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sinkronisasi Terakhir</div>
            <div className="text-sm font-semibold flex items-center gap-1 mt-1">
              <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
              {lastSyncedAt ? formatDateID(lastSyncedAt) : "Belum pernah sync"}
            </div>
          </div>
        </div>

        {recentLogs.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Log Aktivitas Email Masuk Terbaru:
            </div>
            <div className="space-y-1.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border p-2 text-xs"
                >
                  <div className="truncate max-w-[200px]">
                    <span className="font-semibold">{log.sender}</span>
                    <span className="text-muted-foreground ml-2 font-mono text-[10px]">
                      ID: {log.emailMessageId}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateID(log.receivedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

