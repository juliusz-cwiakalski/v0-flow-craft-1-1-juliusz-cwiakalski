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

  // Prefer status history
  let count = 0
  let hasHistory = false

  for (const issue of issues) {
     if (issue.history && issue.history.length > 0) {
       hasHistory = true
       const doneEntries = issue.history.filter(
         (entry) => entry.field === "status" && entry.to === "Done" && new Date(entry.atISO) >= fromDate && new Date(entry.atISO) <= toDate,
       )
       if (doneEntries.length > 0) {
         count++
       }
     }
  }

  // Fallback to updatedAt approximation if no history
  if (!hasHistory) {
    count = issues.filter((i) => i.status === "Done" && i.updatedAt >= fromDate && i.updatedAt <= toDate).length
    return { count, approximate: true }
  }

  return { count, approximate: false }
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
