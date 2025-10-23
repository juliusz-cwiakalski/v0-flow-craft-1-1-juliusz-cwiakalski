"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WipPressureResult } from "@/lib/dashboard-utils"
import { useDispatch } from "react-redux"
import { setWipThreshold } from "@/lib/redux/slices/preferencesSlice"
import { useState } from "react"

interface WipPressureCardProps {
  data: WipPressureResult
}

export function WipPressureCard({ data }: WipPressureCardProps) {
  const dispatch = useDispatch()
  const [val, setVal] = useState<string>(String(data.threshold))

  const levelColor = data.level === "red" ? "text-red-600" : data.level === "amber" ? "text-amber-600" : "text-green-600"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">WIP Pressure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className={`text-3xl font-bold ${levelColor}`}>{data.wip}</div>
          <div className="text-sm text-muted-foreground">WIP / Threshold = {data.wip} / {data.threshold} ({(data.ratio * 100).toFixed(0)}%)</div>
          <div className="flex items-center gap-2">
            <label htmlFor="wip-threshold" className="text-sm text-muted-foreground">Threshold</label>
            <input
              id="wip-threshold"
              type="number"
              inputMode="numeric"
              className="w-20 border rounded px-2 py-1 text-sm"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => {
                const n = parseInt(val, 10)
                if (!Number.isNaN(n) && n > 0) {
                  dispatch(setWipThreshold(n))
                } else {
                  setVal(String(data.threshold))
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
