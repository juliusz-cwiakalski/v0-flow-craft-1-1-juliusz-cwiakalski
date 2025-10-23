"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BlockedAndStaleResult } from "@/lib/dashboard-utils"
import { useEffect } from "react"
import { trackEvent } from "@/lib/telemetry"

interface BlockedStaleCardProps {
  data: BlockedAndStaleResult
  onOpenIssues?: () => void
}

export function BlockedStaleCard({ data, onOpenIssues }: BlockedStaleCardProps) {
  useEffect(() => {
    trackEvent("blocked_stale_card_viewed", { totalBlocked: data.totalBlocked, totalStale: data.totalStale })
  }, [data.totalBlocked, data.totalStale])
  const total = data.totalBlocked + data.totalStale
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Blocked & Stale</span>
          {onOpenIssues && (
            <button
              type="button"
              onClick={onOpenIssues}
              className="text-xs text-blue-600 underline decoration-dotted"
              aria-label="Open Issues with blocked or stale filters"
            >
              Open Issues →
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No blocked or stale issues</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blocked</span>
              <span className="font-medium">{data.totalBlocked}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stale</span>
              <span className="font-medium">{data.totalStale}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
