"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CycleTimeStatsResult } from "@/lib/dashboard-utils"

interface CycleTimeTrendCardProps {
  data: CycleTimeStatsResult
}

export function CycleTimeTrendCard({ data }: CycleTimeTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cycle Time (In Progress → Done)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.insufficientData ? (
          <div className="text-sm text-muted-foreground text-center py-4">Insufficient data</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Median</div>
              <div className="text-3xl font-bold">{data.median}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">p75</div>
              <div className="text-3xl font-bold">{data.p75}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
