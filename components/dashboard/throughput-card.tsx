"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ThroughputResult } from "@/lib/dashboard-utils"

interface ThroughputCardProps {
  data: ThroughputResult
}

export function ThroughputCard({ data }: ThroughputCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Throughput (rolling)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            {data.count === 0 ? (
              <div className="text-sm text-muted-foreground py-4">No throughput in time range</div>
            ) : (
              <>
                <div className="text-4xl font-bold">{data.count}</div>
                <div className="text-sm text-muted-foreground mt-1">Issues completed</div>
              </>
            )}
          </div>
          {data.approximate && (
            <div className="text-xs text-muted-foreground text-center">
              <span
                tabIndex={0}
                role="tooltip"
                aria-label="Throughput is approximate because status-change history is missing. Based on updatedAt timestamp."
                className="underline decoration-dotted cursor-help"
                title="Throughput is approximate because status-change history is missing. Based on updatedAt timestamp."
              >
                ⚠️ Approximate (based on updatedAt)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
