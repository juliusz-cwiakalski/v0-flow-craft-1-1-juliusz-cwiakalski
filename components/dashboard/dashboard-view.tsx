"use client"
import { Badge } from "@/components/ui/badge"
import { ScopeFilters } from "@/components/scope-filters"
import { StatusBreakdownCard } from "@/components/dashboard/status-breakdown-card"
import { ActiveSprintProgressCard } from "@/components/dashboard/active-sprint-progress-card"
import { ThroughputCard } from "@/components/dashboard/throughput-card"
import { WorkloadByAssigneeCard } from "@/components/dashboard/workload-by-assignee-card"
import { VelocityCard } from "@/components/dashboard/velocity-card"
import { BlockedStaleCard } from "@/components/dashboard/blocked-stale-card"
import { WipPressureCard } from "@/components/dashboard/wip-pressure-card"
import { CycleTimeTrendCard } from "@/components/dashboard/cycle-time-trend-card"
import { DeliveryEtaCard } from "@/components/dashboard/delivery-eta-card"
import type { Issue, Sprint, Project, Team, DashboardTimeRange, TimeRangePreset } from "@/types"
import {
  deriveCountsByStatus,
  deriveActiveSprintProgress,
  deriveThroughput,
  deriveWorkloadByAssignee,
  applyScopeFilters,
  deriveVelocityBySprint,
  deriveBlockedAndStale,
  deriveWipPressure,
  deriveCycleTimeStats,
  deriveDeliveryEtaPerProject,
} from "@/lib/dashboard-utils"
import { trackEvent } from "@/lib/telemetry"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { setCurrentView } from "@/lib/redux/slices/uiSlice"

interface DashboardViewProps {
  issues: Issue[]
  sprints: Sprint[]
  projects: Project[]
  teams: Team[]
  selectedProjectIds: string[]
  selectedTeamIds: string[]
  timeRange: DashboardTimeRange
  onProjectsChange: (ids: string[]) => void
  onTeamsChange: (ids: string[]) => void
  onClearFilters: () => void
  onTimeRangeChange: (range: DashboardTimeRange) => void
}

export function DashboardView({
  issues,
  sprints,
  projects,
  teams,
  selectedProjectIds,
  selectedTeamIds,
  timeRange,
  onProjectsChange,
  onTeamsChange,
  onClearFilters,
  onTimeRangeChange,
}: DashboardViewProps) {
  const dispatch = useDispatch()
  const { wipThreshold, staleAgeDays } = useSelector((state: RootState) => state.preferences)
  // Track dashboard view opened
  useEffect(() => {
    trackEvent("dashboard_view_opened", {
      projectIds: selectedProjectIds,
      teamIds: selectedTeamIds,
      timeRange: {
        preset: timeRange.preset,
        fromISO: timeRange.fromISO,
        toISO: timeRange.toISO,
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply scope filters
  const scopedIssues = applyScopeFilters(issues, selectedProjectIds, selectedTeamIds)

  // Derive metrics
  const statusBreakdown = deriveCountsByStatus(scopedIssues)
  const sprintProgress = deriveActiveSprintProgress(scopedIssues, sprints)
  const throughput = deriveThroughput(scopedIssues, timeRange)
  const workload = deriveWorkloadByAssignee(scopedIssues, 5)
  const velocity = deriveVelocityBySprint(scopedIssues, sprints, 5)
  const blockedStale = deriveBlockedAndStale(scopedIssues, staleAgeDays)
  const wip = deriveWipPressure(scopedIssues, wipThreshold)
  const cycle = deriveCycleTimeStats(scopedIssues, timeRange)
  const eta = deriveDeliveryEtaPerProject(scopedIssues, sprints, timeRange)

  const handlePresetChange = (preset: TimeRangePreset) => {
    const newRange: DashboardTimeRange = { preset }
    onTimeRangeChange(newRange)
    trackEvent("dashboard_time_range_changed", { preset: newRange.preset })
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with scope and time controls */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>

        <ScopeFilters
          projects={projects}
          teams={teams}
          selectedProjectIds={selectedProjectIds}
          selectedTeamIds={selectedTeamIds}
          onProjectsChange={onProjectsChange}
          onTeamsChange={onTeamsChange}
          onClearFilters={onClearFilters}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Range:</span>
          <div className="flex gap-2">
            <Badge
              variant={timeRange.preset === "7d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handlePresetChange("7d")}
            >
              Last 7 days
            </Badge>
            <Badge
              variant={timeRange.preset === "14d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handlePresetChange("14d")}
            >
              Last 14 days
            </Badge>
            <Badge
              variant={timeRange.preset === "30d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handlePresetChange("30d")}
            >
              Last 30 days
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard cards in responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusBreakdownCard data={statusBreakdown} />
        <ActiveSprintProgressCard data={sprintProgress} />
        <ThroughputCard data={throughput} />
        <WorkloadByAssigneeCard data={workload} />
        <VelocityCard data={velocity} />
        <BlockedStaleCard data={blockedStale} onOpenIssues={() => dispatch(setCurrentView("issues"))} />
        <WipPressureCard data={wip} />
        <CycleTimeTrendCard data={cycle} />
        <DeliveryEtaCard data={eta} />
      </div>
    </div>
  )
}
