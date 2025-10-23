"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DeliveryEtaEntry } from "@/lib/dashboard-utils"
import { useEffect } from "react"
import { trackEvent } from "@/lib/telemetry"

import type { Project } from "@/types"

interface DeliveryEtaCardProps {
  data: DeliveryEtaEntry[]
  projects: Project[]
}

export function DeliveryEtaCard({ data, projects }: DeliveryEtaCardProps) {
  useEffect(() => {
    trackEvent("eta_card_viewed", { projects: data.length })
  }, [data.length])
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery ETA (per project)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No active projects</div>
        ) : (
          <div className="space-y-3">
            {data.map((p) => (
              <div key={p.projectId} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{projects.find(prj => prj.id === p.projectId)?.name ?? p.projectId}</span>
                <span className="font-medium">
                  {p.etaOptimisticDays !== null && p.etaMedianDays !== null
                    ? `${p.etaOptimisticDays}–${p.etaMedianDays} days`
                    : "insufficient"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
