"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Issue } from "@/types"
import { trackEvent } from "@/lib/telemetry"

interface StatusHistoryPanelProps {
  issue: Issue
}

export function StatusHistoryPanel({ issue }: StatusHistoryPanelProps) {
  React.useEffect(() => {
    trackEvent("status_history_panel_opened", { issueId: issue.id })
  }, [issue.id])

  if (!issue.statusChangeHistory || issue.statusChangeHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No status history available.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Change History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-2">
          {issue.statusChangeHistory.map((entry, idx) => (
            <li key={idx}>
              <span className="font-mono text-xs">{entry.atISO}</span>:
              <span className="ml-2">{entry.from} → {entry.to}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
