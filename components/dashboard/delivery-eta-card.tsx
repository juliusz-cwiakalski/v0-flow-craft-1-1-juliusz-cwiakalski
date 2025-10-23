"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DeliveryEtaEntry } from "@/lib/dashboard-utils"

interface DeliveryEtaCardProps {
  data: DeliveryEtaEntry[]
}

export function DeliveryEtaCard({ data }: DeliveryEtaCardProps) {
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
                <span className="text-muted-foreground">{p.projectId}</span>
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
