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
      expect(deriveThroughput([], range)).toEqual({ count: 0, approximate: false })
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
      expect(result.count).toBe(2)
      expect(result.approximate).toBe(true)
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

  describe("deriveVelocityBySprint", () => {
    it("returns last N sprints with done counts", () => {
      const sprints: Sprint[] = [
        { id: "s1", name: "S1", status: "Completed", startDate: new Date("2025-01-01"), endDate: new Date("2025-01-08") } as Sprint,
        { id: "s2", name: "S2", status: "Completed", startDate: new Date("2025-01-08"), endDate: new Date("2025-01-15") } as Sprint,
        { id: "s3", name: "S3", status: "Completed", startDate: new Date("2025-01-15"), endDate: new Date("2025-01-22") } as Sprint,
      ]
      const issues: Issue[] = [
        { sprintId: "s1", status: "Done" } as Issue,
        { sprintId: "s1", status: "Done" } as Issue,
        { sprintId: "s2", status: "Done" } as Issue,
        { sprintId: "s2", status: "Todo" } as Issue,
        { sprintId: "s3", status: "In Progress" } as Issue,
      ]
      const result = deriveVelocityBySprint(issues, sprints, 2)
      expect(result.length).toBe(2)
      expect(result[0].sprintId).toBe("s3")
      expect(result[1].sprintId).toBe("s2")
      expect(result[1].doneCount).toBe(1)
    })
  })

  describe("deriveBlockedAndStale", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date("2025-01-10T00:00:00Z"))
    })
    afterAll(() => {
      jest.useRealTimers()
    })
    it("computes per-status blocked and stale totals", () => {
      const issues: Issue[] = [
        {
          status: "In Progress",
          updatedAt: new Date("2025-01-01T00:00:00Z"),
          createdAt: new Date("2025-01-01T00:00:00Z"),
          id: "i1",
          title: "t1",
          description: "d1",
          priority: "P2",
          history: [
            { field: "blocked", from: false, to: true, atISO: "2025-01-02T00:00:00Z" },
          ],
        } as unknown as Issue,
        {
          status: "Todo",
          updatedAt: new Date("2025-01-09T00:00:00Z"),
          createdAt: new Date("2025-01-05T00:00:00Z"),
          id: "i2",
          title: "t2",
          description: "d2",
          priority: "P3",
          history: [],
        } as unknown as Issue,
      ]
      const res = deriveBlockedAndStale(issues, 7)
      expect(res.totalBlocked).toBe(1)
      expect(res.totalStale).toBe(1)
      expect(res.perStatus["In Progress"].blocked).toBe(1)
      expect(res.perStatus["In Progress"].stale).toBe(1)
      expect(res.perStatus["Todo"].stale).toBe(0)
    })
  })

  describe("deriveWipPressure", () => {
    it("maps to green, amber, red levels", () => {
      const base: Issue[] = Array.from({ length: 5 }, () => ({ status: "Todo" } as Issue))
      expect(deriveWipPressure(base, 10).level).toBe("green")
      const eight: Issue[] = Array.from({ length: 8 }, () => ({ status: "In Progress" } as Issue))
      expect(deriveWipPressure(eight, 10).level).toBe("amber")
      const eleven: Issue[] = Array.from({ length: 11 }, () => ({ status: "In Review" } as Issue))
      expect(deriveWipPressure(eleven, 10).level).toBe("red")
    })
  })

  describe("deriveCycleTimeStats", () => {
    it("computes median and p75 within range", () => {
      const issues: Issue[] = [
        {
          id: "i1", title: "t1", description: "d1", priority: "P1", status: "Done",
          createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-03"),
          history: [
            { field: "status", from: null, to: "In Progress", atISO: "2025-01-01T00:00:00Z" },
            { field: "status", from: null, to: "Done", atISO: "2025-01-02T00:00:00Z" },
          ],
        } as unknown as Issue,
        {
          id: "i2", title: "t2", description: "d2", priority: "P1", status: "Done",
          createdAt: new Date("2025-01-02"), updatedAt: new Date("2025-01-05"),
          history: [
            { field: "status", from: null, to: "In Progress", atISO: "2025-01-02T00:00:00Z" },
            { field: "status", from: null, to: "Done", atISO: "2025-01-05T00:00:00Z" },
          ],
        } as unknown as Issue,
        {
          id: "i3", title: "t3", description: "d3", priority: "P1", status: "Done",
          createdAt: new Date("2025-01-04"), updatedAt: new Date("2025-01-06"),
          history: [
            { field: "status", from: null, to: "In Progress", atISO: "2025-01-04T00:00:00Z" },
            { field: "status", from: null, to: "Done", atISO: "2025-01-06T00:00:00Z" },
          ],
        } as unknown as Issue,
      ]
      const range: DashboardTimeRange = { preset: "custom", fromISO: "2025-01-01T00:00:00Z", toISO: "2025-01-10T00:00:00Z" }
      const result = deriveCycleTimeStats(issues, range)
      expect(result.median).toBe(2)
      expect(result.p75).toBe(3)
      expect(result.insufficientData).toBe(false)
    })
    it("returns insufficient when transitions missing or outside", () => {
      const issues: Issue[] = [
        {
          id: "i4", title: "t4", description: "d4", priority: "P2", status: "Done",
          createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-03"),
          history: [
            { field: "status", from: null, to: "In Progress", atISO: "2024-01-01T00:00:00Z" },
            { field: "status", from: null, to: "Done", atISO: "2024-01-03T00:00:00Z" },
          ],
        } as unknown as Issue,
      ]
      const range: DashboardTimeRange = { preset: "custom", fromISO: "2025-01-01T00:00:00Z", toISO: "2025-01-10T00:00:00Z" }
      const result = deriveCycleTimeStats(issues, range)
      expect(result).toEqual({ median: null, p75: null, insufficientData: true })
    })
  })

  describe("deriveDeliveryEtaPerProject", () => {
    it("computes ETA using recent sprint throughput and remaining", () => {
      const sprints: Sprint[] = [
        { id: "s1", name: "S1", status: "Completed", startDate: new Date("2025-01-01"), endDate: new Date("2025-01-08") } as Sprint,
        { id: "s2", name: "S2", status: "Completed", startDate: new Date("2025-01-08"), endDate: new Date("2025-01-15") } as Sprint,
      ]
      const issues: Issue[] = [
        // p1 throughput
        { projectId: "p1", status: "Done", updatedAt: new Date("2025-01-03"), createdAt: new Date("2025-01-01"), id: "i1", title: "t1", description: "d1", priority: "P2" } as unknown as Issue,
        { projectId: "p1", history: [{ field: "status", from: "In Review", to: "Done", atISO: "2025-01-09T00:00:00Z" }], status: "Done", updatedAt: new Date("2025-01-09"), createdAt: new Date("2025-01-05"), id: "i2", title: "t2", description: "d2", priority: "P3" } as unknown as Issue,
        // remaining in p1
        { projectId: "p1", status: "Todo" } as Issue,
        { projectId: "p1", status: "In Progress" } as Issue,
        { projectId: "p1", status: "In Review" } as Issue,
        // p2 with remaining but zero throughput
        { projectId: "p2", status: "Todo" } as Issue,
        { projectId: "p2", status: "In Progress" } as Issue,
      ]
      const range: DashboardTimeRange = { preset: "custom", fromISO: "2025-01-01T00:00:00Z", toISO: "2025-01-20T00:00:00Z" }
      const result = deriveDeliveryEtaPerProject(issues, sprints, range)
      const p1 = result.find(r => r.projectId === "p1")!
      expect(p1.remaining).toBe(3)
      expect(p1.recentThroughputBest).toBeGreaterThanOrEqual(1)
      expect(p1.recentThroughputMedian).toBeGreaterThan(0)
      expect(p1.etaMedianDays).not.toBeNull()
      expect(p1.etaOptimisticDays).not.toBeNull()
      const p2 = result.find(r => r.projectId === "p2")!
      expect(p2.remaining).toBe(2)
      expect(p2.recentThroughputMedian).toBe(0)
      expect(p2.recentThroughputBest).toBe(0)
      expect(p2.etaMedianDays).toBeNull()
      expect(p2.etaOptimisticDays).toBeNull()
    })
  })
})
