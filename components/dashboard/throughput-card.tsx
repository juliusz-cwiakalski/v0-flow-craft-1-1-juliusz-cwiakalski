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
            <div className="text-4xl font-bold">{data.count}</div>
            <div className="text-sm text-muted-foreground mt-1">Issues completed</div>
          </div>
          {data.approximate && (
            <div className="text-xs text-muted-foreground text-center" title="Using updatedAt approximation">
              ⚠️ Approximate (based on updatedAt)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
