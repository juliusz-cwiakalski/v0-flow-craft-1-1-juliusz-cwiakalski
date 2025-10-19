"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkloadEntry } from "@/lib/dashboard-utils"

interface WorkloadByAssigneeCardProps {
  data: WorkloadEntry[]
}

export function WorkloadByAssigneeCard({ data }: WorkloadByAssigneeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workload by Assignee</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No non-done issues</div>
          ) : (
            data.map((entry) => (
              <div key={entry.assigneeLabel} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{entry.assigneeLabel}</span>
                <span className="text-sm font-medium">{entry.count}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
