"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VelocityBySprintEntry } from "@/lib/dashboard-utils"

interface VelocityCardProps {
  data: VelocityBySprintEntry[]
}

export function VelocityCard({ data }: VelocityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Velocity (last sprints)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No completed sprints</div>
          ) : (
            data.map((s) => (
              <div key={s.sprintId} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-medium">{s.doneCount}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
