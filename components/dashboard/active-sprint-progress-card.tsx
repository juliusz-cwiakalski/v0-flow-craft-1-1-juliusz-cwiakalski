"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/components/ui/locale-context"
import type { ActiveSprintProgress } from "@/lib/dashboard-utils"

interface ActiveSprintProgressCardProps {
  data: ActiveSprintProgress
}

export function ActiveSprintProgressCard({ data }: ActiveSprintProgressCardProps) {
  const locale = useLocale()
  if (!data.sprintMeta) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">No active sprint</div>
        </CardContent>
      </Card>
    )
  }

  if (data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Sprint Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">No issues in active sprint</div>
        </CardContent>
      </Card>
    )
  }

  const { sprintMeta } = data
  const startDate = new Date(sprintMeta.startDate).toLocaleDateString(locale)
  const endDate = new Date(sprintMeta.endDate).toLocaleDateString(locale)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active Sprint Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">{sprintMeta.name}</div>
            <div className="text-xs text-muted-foreground">
              {startDate} - {endDate}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-2xl font-bold">{data.percent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Done / Total</span>
              <span className="text-sm font-medium">
                {data.done} / {data.total}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
