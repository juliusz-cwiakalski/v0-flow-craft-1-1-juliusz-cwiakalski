"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatusBreakdown } from "@/lib/dashboard-utils"

interface StatusBreakdownCardProps {
  data: StatusBreakdown
}

export function StatusBreakdownCard({ data }: StatusBreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Issues by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Todo</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{data.todo}</span>
              <span className="text-xs text-muted-foreground">({data.todoPercent}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">In Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{data.inProgress}</span>
              <span className="text-xs text-muted-foreground">({data.inProgressPercent}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">In Review</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{data.inReview}</span>
              <span className="text-xs text-muted-foreground">({data.inReviewPercent}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Done</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{data.done}</span>
              <span className="text-xs text-muted-foreground">({data.donePercent}%)</span>
            </div>
          </div>
          <div className="pt-2 border-t flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-medium">{data.total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
