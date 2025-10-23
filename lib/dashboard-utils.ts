import type { Issue, Sprint, DashboardTimeRange } from "@/types"

export interface StatusBreakdown {
  todo: number
  inProgress: number
  inReview: number
  done: number
  total: number
  todoPercent: number
  inProgressPercent: number
  inReviewPercent: number
  donePercent: number
}

export function deriveCountsByStatus(issues: Issue[]): StatusBreakdown {
  const todo = issues.filter((i) => i.status === "Todo").length
  const inProgress = issues.filter((i) => i.status === "In Progress").length
  const inReview = issues.filter((i) => i.status === "In Review").length
  const done = issues.filter((i) => i.status === "Done").length
  const total = issues.length

  return {
    todo,
    inProgress,
    inReview,
    done,
    total,
    todoPercent: total > 0 ? Math.round((todo / total) * 100) : 0,
    inProgressPercent: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    inReviewPercent: total > 0 ? Math.round((inReview / total) * 100) : 0,
    donePercent: total > 0 ? Math.round((done / total) * 100) : 0,
  }
}

export interface ActiveSprintProgress {
  done: number
  total: number
  percent: number
  sprintMeta?: {
    name: string
    startDate: Date
    endDate: Date
  }
}

export function deriveActiveSprintProgress(issues: Issue[], sprints: Sprint[]): ActiveSprintProgress {
  const activeSprint = sprints.find((s) => s.status === "Active")

  if (!activeSprint) {
    return { done: 0, total: 0, percent: 0 }
  }

  const sprintIssues = issues.filter((i) => i.sprintId === activeSprint.id)
  const done = sprintIssues.filter((i) => i.status === "Done").length
  const total = sprintIssues.length

  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    sprintMeta: {
      name: activeSprint.name,
      startDate: activeSprint.startDate,
      endDate: activeSprint.endDate,
    },
  }
}

export interface ThroughputResult {
  count: number
  approximate: boolean
}

export function deriveThroughput(issues: Issue[], timeRange: DashboardTimeRange): ThroughputResult {
  const { fromDate, toDate } = getTimeRangeDates(timeRange)

  let count = 0
  let approximate = false

  for (const issue of issues) {
    let counted = false
    if (issue.history && issue.history.length > 0) {
      const doneEntries = issue.history.filter(
        (entry) => entry.field === "status" && entry.to === "Done" && new Date(entry.atISO) >= fromDate && new Date(entry.atISO) <= toDate,
      )
      if (doneEntries.length > 0) {
        count++
        counted = true
      }
    }
    if (!counted && issue.status === "Done" && issue.updatedAt && issue.updatedAt >= fromDate && issue.updatedAt <= toDate) {
      count++
      approximate = true
    }
  }

  return { count, approximate }
}


export interface WorkloadEntry {
  assigneeId: string // "unassigned" sentinel or userId
  count: number
}

export function deriveWorkloadByAssignee(issues: Issue[], topN = 5): WorkloadEntry[] {
  const nonDoneIssues = issues.filter((i) => i.status !== "Done")

  const assigneeCounts = new Map<string, number>()

  for (const issue of nonDoneIssues) {
    const key = issue.assigneeUserId && issue.assigneeUserId !== "" ? issue.assigneeUserId : "unassigned"
    assigneeCounts.set(key, (assigneeCounts.get(key) || 0) + 1)
  }

  const entries: WorkloadEntry[] = Array.from(assigneeCounts.entries()).map(([assigneeId, count]) => ({
    assigneeId,
    count,
  }))

  // Sort by count descending and take top N
  entries.sort((a, b) => b.count - a.count)
  return entries.slice(0, topN)
}

function getTimeRangeDates(timeRange: DashboardTimeRange): { fromDate: Date; toDate: Date } {
  const toDate = new Date()
  let fromDate = new Date()

  if (timeRange.preset === "custom" && timeRange.fromISO && timeRange.toISO) {
    fromDate = new Date(timeRange.fromISO)
    return { fromDate, toDate: new Date(timeRange.toISO) }
  }

  // Rolling presets
  switch (timeRange.preset) {
    case "7d":
      fromDate.setDate(toDate.getDate() - 7)
      break
    case "14d":
      fromDate.setDate(toDate.getDate() - 14)
      break
    case "30d":
      fromDate.setDate(toDate.getDate() - 30)
      break
  }

  return { fromDate, toDate }
}

export function applyScopeFilters(issues: Issue[], selectedProjectIds: string[], selectedTeamIds: string[]): Issue[] {
  let filtered = issues

  if (selectedProjectIds.length > 0) {
    filtered = filtered.filter((i) => i.projectId && selectedProjectIds.includes(i.projectId))
  }

  if (selectedTeamIds.length > 0) {
    filtered = filtered.filter((i) => i.teamId && selectedTeamIds.includes(i.teamId))
  }

  return filtered
}

export interface VelocityBySprintEntry {
  sprintId: string
  name: string
  startDate: Date
  endDate: Date
  doneCount: number
}

export function deriveVelocityBySprint(
  issues: Issue[],
  sprints: Sprint[],
  limit = 5
): VelocityBySprintEntry[] {
  if (!sprints || sprints.length === 0) return []
  // Sort sprints by endDate descending
  const sorted = [...sprints].sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
  const selected = sorted.slice(0, limit)
  return selected.map(sprint => {
    const sprintIssues = issues.filter(i => i.sprintId === sprint.id && i.status === "Done")
    return {
      sprintId: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      doneCount: sprintIssues.length,
    }
  })
}

export interface BlockedAndStaleResult {
  perStatus: {
    [status: string]: {
      blocked: number
      stale: number
    }
  }
  totalBlocked: number
  totalStale: number
}

export function deriveBlockedAndStale(
  issues: Issue[],
  staleAgeDays: number
): BlockedAndStaleResult {
  const now = new Date()
  const staleCutoff = new Date(now.getTime() - staleAgeDays * 24 * 60 * 60 * 1000)
  let totalBlocked = 0
  let totalStale = 0
  const perStatus: { [status: string]: { blocked: number; stale: number } } = {}
  for (const issue of issues) {
    const status = issue.status || "Unknown"
    // Stale: updatedAt older than cutoff
    const isStale = issue.updatedAt && issue.updatedAt < staleCutoff
    // Blocked: latest history entry with blocked: true, or fallback (none)
    let isBlocked = false
    if (issue.history && issue.history.length > 0) {
      // Find latest entry with field "blocked" and to === true
      const blockedEntries = issue.history.filter(
        (entry) => entry.field === "blocked" && entry.to === true
      )
      if (blockedEntries.length > 0) {
        isBlocked = true
      }
    }
    // If no history, fallback: infer not blocked
    if (!perStatus[status]) perStatus[status] = { blocked: 0, stale: 0 }
    if (isBlocked) {
      perStatus[status].blocked++
      totalBlocked++
    }
    if (isStale) {
      perStatus[status].stale++
      totalStale++
    }
  }
  return { perStatus, totalBlocked, totalStale }
}

export interface WipPressureResult {
  wip: number
  threshold: number
  ratio: number
  level: 'green' | 'amber' | 'red'
}

export function deriveWipPressure(
  issues: Issue[],
  threshold: number
): WipPressureResult {
  const wip = issues.filter(i => i.status !== 'Done').length
  const ratio = threshold > 0 ? wip / threshold : 0
  let level: 'green' | 'amber' | 'red' = 'green'
  if (ratio >= 0.8 && ratio <= 1) level = 'amber'
  if (ratio > 1) level = 'red'
  return { wip, threshold, ratio, level }
}

export interface CycleTimeStatsResult {
  median: number | null
  p75: number | null
  insufficientData: boolean
}

export function deriveCycleTimeStats(
  issues: Issue[],
  range: DashboardTimeRange
): CycleTimeStatsResult {
  // Helper to get time range
  function getTimeRangeDates(timeRange: DashboardTimeRange): { fromDate: Date; toDate: Date } {
    const toDate = new Date()
    let fromDate = new Date()
    if (timeRange.preset === "custom" && timeRange.fromISO && timeRange.toISO) {
      fromDate = new Date(timeRange.fromISO)
      return { fromDate, toDate: new Date(timeRange.toISO) }
    }
    switch (timeRange.preset) {
      case "7d":
        fromDate.setDate(toDate.getDate() - 7)
        break
      case "14d":
        fromDate.setDate(toDate.getDate() - 14)
        break
      case "30d":
        fromDate.setDate(toDate.getDate() - 30)
        break
    }
    return { fromDate, toDate }
  }
  const { fromDate, toDate } = getTimeRangeDates(range)
  // For each issue, find first transition to In Progress, then first to Done after that, both within range
  const cycleTimes: number[] = []
  for (const issue of issues) {
    if (!issue.history || issue.history.length === 0) continue
    // Find first In Progress
    const inProgressEntry = issue.history.find(
      (entry) => entry.field === "status" && entry.to === "In Progress" && new Date(entry.atISO) >= fromDate && new Date(entry.atISO) <= toDate
    )
    if (!inProgressEntry) continue
    // Find first Done after In Progress
    const doneEntry = issue.history.find(
      (entry) => entry.field === "status" && entry.to === "Done" && new Date(entry.atISO) >= new Date(inProgressEntry.atISO) && new Date(entry.atISO) <= toDate
    )
    if (!doneEntry) continue
    // Compute cycle time in days
    const start = new Date(inProgressEntry.atISO)
    const end = new Date(doneEntry.atISO)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue
    const cycleDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (cycleDays < 0) continue
    cycleTimes.push(cycleDays)
  }
  if (cycleTimes.length === 0) return { median: null, p75: null, insufficientData: true }
  // Sort and compute median/p75
  cycleTimes.sort((a, b) => a - b)
  const median = cycleTimes.length % 2 === 1
    ? cycleTimes[Math.floor(cycleTimes.length / 2)]
    : (cycleTimes[cycleTimes.length / 2 - 1] + cycleTimes[cycleTimes.length / 2]) / 2
  const p75 = cycleTimes[Math.floor(cycleTimes.length * 0.75)]
  return { median, p75, insufficientData: false }
}

export interface DeliveryEtaEntry {
  projectId: string
  remaining: number
  recentThroughputMedian: number
  recentThroughputBest: number
  etaMedianDays: number | null
  etaOptimisticDays: number | null
}

export function deriveDeliveryEtaPerProject(
  issues: Issue[],
  sprints: Sprint[],
  range: DashboardTimeRange
): DeliveryEtaEntry[] {
  const projects = Array.from(new Set(issues.map(i => i.projectId).filter((p): p is string => !!p)))
  const { fromDate, toDate } = getTimeRangeDates(range)
  const recentSprints = (sprints || []).filter(s => s.status === "Completed" && s.endDate >= fromDate && s.endDate <= toDate)
  const usedSprints = recentSprints.length > 0 ? recentSprints : []
  const sprintLengths = usedSprints
    .map(s => (s.endDate.getTime() - s.startDate.getTime()) / (1000 * 60 * 60 * 24))
    .filter(n => n > 0)
  const medianSprintDays = sprintLengths.length > 0
    ? (() => { const arr = [...sprintLengths].sort((a, b) => a - b); return arr.length % 2 ? arr[Math.floor(arr.length / 2)] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2 })()
    : 7

  function countDoneInWindowForProject(projectId: string, start: Date, end: Date): number {
    let count = 0
    for (const issue of issues) {
      if (issue.projectId !== projectId) continue
      let counted = false
      if (issue.history && issue.history.length) {
        const done = issue.history.find(e => e.field === "status" && e.to === "Done" && new Date(e.atISO) >= start && new Date(e.atISO) <= end)
        if (done) { count++; counted = true }
      }
      if (!counted && issue.status === "Done" && issue.updatedAt && issue.updatedAt >= start && issue.updatedAt <= end) {
        count++
      }
    }
    return count
  }

  const results: DeliveryEtaEntry[] = []
  for (const projectId of projects) {
    const remaining = issues.filter(i => i.projectId === projectId && i.status !== "Done").length
    let counts: number[] = []
    if (usedSprints.length > 0) {
      counts = usedSprints.map(s => countDoneInWindowForProject(projectId, s.startDate, s.endDate))
    } else {
      counts = [countDoneInWindowForProject(projectId, fromDate, toDate)]
    }
    const nonNeg = counts.map(c => Math.max(0, c))
    const sorted = [...nonNeg].sort((a, b) => a - b)
    const recentThroughputBest = sorted.length ? sorted[sorted.length - 1] : 0
    const recentThroughputMedian = sorted.length
      ? (sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
      : 0
    let etaMedianDays: number | null = null
    let etaOptimisticDays: number | null = null
    if (recentThroughputMedian > 0) {
      etaMedianDays = Math.ceil((remaining / recentThroughputMedian) * medianSprintDays)
    }
    if (recentThroughputBest > 0) {
      etaOptimisticDays = Math.ceil((remaining / recentThroughputBest) * medianSprintDays)
    }
    results.push({ projectId, remaining, recentThroughputMedian, recentThroughputBest, etaMedianDays, etaOptimisticDays })
  }
  return results
}
