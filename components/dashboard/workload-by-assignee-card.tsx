"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkloadEntry } from "@/lib/dashboard-utils"
import { useSelector } from "react-redux"
import { selectAllUsers } from "@/lib/redux/slices/usersSlice"
import type { RootState } from "@/lib/redux/store"

interface WorkloadByAssigneeCardProps {
  data: WorkloadEntry[]
}

export function WorkloadByAssigneeCard({ data }: WorkloadByAssigneeCardProps) {
  const users = useSelector((state: RootState) => selectAllUsers(state))
  const userNameById: Record<string, string> = Object.fromEntries(users.map((u) => [u.id, u.name]))

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
            data.map((entry) => {
              const label = entry.assigneeId === "unassigned" ? "Unassigned" : userNameById[entry.assigneeId] || "Unknown"
              return (
                <div key={entry.assigneeId} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{entry.count}</span>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
