import {
  deriveCountsByStatus,
  deriveActiveSprintProgress,
  deriveThroughput,
  deriveWorkloadByAssignee,
  applyScopeFilters,
} from "./dashboard-utils"
import type { Issue, Sprint, DashboardTimeRange } from "@/types"

describe("dashboard-utils", () => {
  describe("deriveCountsByStatus", () => {
    it("returns zeros for empty issues", () => {
      expect(deriveCountsByStatus([])).toEqual({
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0,
        total: 0,
        todoPercent: 0,
        inProgressPercent: 0,
        inReviewPercent: 0,
        donePercent: 0,
      })
    })
    it("correctly counts statuses and percentages", () => {
      const issues: Issue[] = [
        { status: "Todo" } as Issue,
        { status: "In Progress" } as Issue,
        { status: "In Review" } as Issue,
        { status: "Done" } as Issue,
        { status: "Done" } as Issue,
      ]
      expect(deriveCountsByStatus(issues)).toMatchObject({
        todo: 1,
        inProgress: 1,
        inReview: 1,
        done: 2,
        total: 5,
        todoPercent: 20,
        inProgressPercent: 20,
        inReviewPercent: 20,
        donePercent: 40,
      })
    })
  })

  describe("deriveActiveSprintProgress", () => {
    it("returns zeros if no active sprint", () => {
      expect(deriveActiveSprintProgress([], [])).toEqual({ done: 0, total: 0, percent: 0 })
    })
    it("calculates progress for active sprint", () => {
      const sprints: Sprint[] = [
        { id: "s1", status: "Active", name: "Sprint 1", startDate: new Date("2023-01-01"), endDate: new Date("2023-01-07") } as Sprint,
      ]
      const issues: Issue[] = [
        { sprintId: "s1", status: "Done" } as Issue,
        { sprintId: "s1", status: "Todo" } as Issue,
        { sprintId: "s1", status: "Done" } as Issue,
        { sprintId: "s2", status: "Done" } as Issue,
      ]
      const result = deriveActiveSprintProgress(issues, sprints)
      expect(result.done).toBe(2)
      expect(result.total).toBe(3)
      expect(result.percent).toBe(67)
      expect(result.sprintMeta?.name).toBe("Sprint 1")
    })
  })

  describe("deriveThroughput", () => {
    it("returns 0 for empty issues", () => {
      const range: DashboardTimeRange = { preset: "7d" }
      expect(deriveThroughput([], range)).toEqual({ count: 0, approximate: true })
    })
    it("counts issues with history status changes to Done in range", () => {
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: lastWeek.toISOString() },
          ],
        } as Issue,
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: now.toISOString() },
          ],
        } as Issue,
        {
          history: [
            { field: "status", from: "Todo", to: "In Progress", atISO: now.toISOString() },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(2)
      expect(result.approximate).toBe(false)
    })
    it("falls back to updatedAt if no history", () => {
      const now = new Date()
      const issues: Issue[] = [
        { status: "Done", updatedAt: now } as Issue,
        { status: "Todo", updatedAt: now } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(1)
      expect(result.approximate).toBe(true)
    })
    it("does not count non-status field changes", () => {
      const now = new Date()
      const issues: Issue[] = [
        {
          history: [
            { field: "title", from: "Old", to: "New", atISO: now.toISOString() },
          ],
        } as Issue,
        {
          history: [
            { field: "description", from: "A", to: "B", atISO: now.toISOString() },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(0)
      expect(result.approximate).toBe(false)
    })
    it("counts only once per issue even with multiple Done status changes", () => {
      const now = new Date()
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: now.toISOString() },
            { field: "status", from: "Todo", to: "Done", atISO: now.toISOString() },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(1)
      expect(result.approximate).toBe(false)
    })
    it("handles mixed history and fallback scenarios", () => {
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: lastWeek.toISOString() },
          ],
        } as Issue,
        {
          history: [
            { field: "status", from: "Todo", to: "In Progress", atISO: now.toISOString() },
          ],
        } as Issue,
        {
          status: "Done", updatedAt: now,
        } as Issue,
        {
          status: "Done", updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(1)
      expect(result.approximate).toBe(false)
    })
    it("returns 0 if history present but no Done status changes in range", () => {
      const now = new Date()
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "Todo", to: "In Progress", atISO: now.toISOString() },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(0)
      expect(result.approximate).toBe(false)
    })
    it("triggers fallback only if none of the issues have history", () => {
      const now = new Date()
      const issues: Issue[] = [
        { status: "Done", updatedAt: now } as Issue,
        { status: "Done", updatedAt: now } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(2)
      expect(result.approximate).toBe(true)
    })
    it("does not count status changes to Done outside the time range", () => {
      const now = new Date()
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(0)
      expect(result.approximate).toBe(false)
    })
    it("ignores malformed/invalid dates in history", () => {
      const issues: Issue[] = [
        {
          history: [
            { field: "status", from: "In Review", to: "Done", atISO: "not-a-date" },
          ],
        } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "7d" }
      const result = deriveThroughput(issues, range)
      expect(result.count).toBe(0)
      expect(result.approximate).toBe(false)
    })
  })

  describe("deriveWorkloadByAssignee", () => {
    it("returns empty for no issues", () => {
      expect(deriveWorkloadByAssignee([])).toEqual([])
    })
    it("counts assigned and unassigned issues", () => {
      const issues: Issue[] = [
        { assigneeUserId: "u1", status: "Todo" } as Issue,
        { assigneeUserId: "u1", status: "In Progress" } as Issue,
        { assigneeUserId: "", status: "Todo" } as Issue,
        { assigneeUserId: undefined, status: "Todo" } as Issue,
        { assigneeUserId: "u2", status: "Done" } as Issue,
      ]
      const result = deriveWorkloadByAssignee(issues)
      expect(result).toEqual(
        expect.arrayContaining([
          { assigneeId: "u1", count: 2 },
          { assigneeId: "unassigned", count: 2 },
        ])
      )
      expect(result.find((r) => r.assigneeId === "u2")).toBeUndefined()
    })
    it("returns top N by count", () => {
      const issues: Issue[] = [
        { assigneeUserId: "u1", status: "Todo" } as Issue,
        { assigneeUserId: "u2", status: "Todo" } as Issue,
        { assigneeUserId: "u3", status: "Todo" } as Issue,
        { assigneeUserId: "u4", status: "Todo" } as Issue,
        { assigneeUserId: "u5", status: "Todo" } as Issue,
        { assigneeUserId: "u6", status: "Todo" } as Issue,
      ]
      const result = deriveWorkloadByAssignee(issues, 3)
      expect(result.length).toBe(3)
    })
  })

  describe("applyScopeFilters", () => {
    const issues: Issue[] = [
      { id: "i1", projectId: "p1", teamId: "t1" } as Issue,
      { id: "i2", projectId: "p2", teamId: "t2" } as Issue,
      { id: "i3", projectId: "p1", teamId: "t2" } as Issue,
      { id: "i4", projectId: "p3", teamId: "t1" } as Issue,
    ]
    it("returns all if no filters", () => {
      expect(applyScopeFilters(issues, [], [])).toEqual(issues)
    })
    it("filters by projectId", () => {
      const filtered = applyScopeFilters(issues, ["p1"], [])
      expect(filtered).toEqual([
        { id: "i1", projectId: "p1", teamId: "t1" },
        { id: "i3", projectId: "p1", teamId: "t2" },
      ])
    })
    it("filters by teamId", () => {
      const filtered = applyScopeFilters(issues, [], ["t2"])
      expect(filtered).toEqual([
        { id: "i2", projectId: "p2", teamId: "t2" },
        { id: "i3", projectId: "p1", teamId: "t2" },
      ])
    })
    it("filters by both projectId and teamId", () => {
      const filtered = applyScopeFilters(issues, ["p1"], ["t2"])
      expect(filtered).toEqual([
        { id: "i3", projectId: "p1", teamId: "t2" },
      ])
    })
    it("returns empty if no matches", () => {
      const filtered = applyScopeFilters(issues, ["pX"], ["tY"])
      expect(filtered).toEqual([])
    })
  })
})
