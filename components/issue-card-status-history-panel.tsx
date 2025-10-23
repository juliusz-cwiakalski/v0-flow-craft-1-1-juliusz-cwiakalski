"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Issue } from "@/types"
import { trackEvent } from "@/lib/telemetry"

interface StatusHistoryPanelProps {
  issue: Issue
}

function formatValue(val: unknown): string {
  if (val instanceof Date) return val.toISOString()
  if (typeof val === "string") return val
  if (typeof val === "number" || typeof val === "boolean") return String(val)
  if (val && typeof val === "object") {
    // Try to handle ISO date strings
    if (val.constructor && val.constructor.name === "Date") {
      // Defensive: some objects may be Date but not instanceof
      // (e.g., from JSON parse)
      try {
        return new Date(val as any).toISOString()
      } catch {
        return String(val)
      }
    }
    // Fallback: JSON.stringify
    return JSON.stringify(val)
  }
  return String(val)
}

export function StatusHistoryPanel({ issue }: StatusHistoryPanelProps) {
  React.useEffect(() => {
    trackEvent("issue_history_panel_opened", { issueId: issue.id })
  }, [issue.id])

  const history = issue.history || []

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issue Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No change history available.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Change History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-2">
          {history.map((entry, idx) => (
            <li key={idx}>
              <span className="font-mono text-xs">{entry.atISO}</span>:
              <span className="ml-2 font-semibold">{entry.field}</span>
              <span className="ml-2">{formatValue(entry.from)} → {formatValue(entry.to)}</span>

              {entry.changedBy && (
                <span className="ml-2 text-xs text-muted-foreground">by {entry.changedBy}</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
