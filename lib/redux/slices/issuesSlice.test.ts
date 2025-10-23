import issuesReducer, {
  addIssue,
  updateIssue,
  updateIssueStatus,
  selectIssueHistory,
  selectStatusChangeHistory,
} from "./issuesSlice"
import type { Issue } from "../../../types"

describe("issuesSlice history recording", () => {
  it("records initial status in history on addIssue", () => {
    const state = { issues: [] }
    const action = addIssue({ title: "Test", status: "Todo", history: [] })
    const newState = issuesReducer(state, action)
    expect(newState.issues[0].history).toEqual([
      expect.objectContaining({ field: "status", from: "Created", to: "Todo" })
    ])
  })

  it("records status and title changes in history on updateIssue", () => {
    const issue: Issue = {
      id: "TSK-1",
      title: "Old Title",
      description: "desc",
      priority: "P2",
      status: "Todo",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        { field: "status", from: "Created", to: "Todo", atISO: new Date().toISOString() }
      ],
    }
    const state = { issues: [issue] }
    const updated = { ...issue, title: "New Title", status: "In Progress" as Issue["status"], history: issue.history ?? [] }
    const action = updateIssue(updated)
const newState = issuesReducer(state, action)
const history = newState.issues[0].history ?? []
expect(history.some(h => h.field === "title" && h.from === "Old Title" && h.to === "New Title")).toBe(true)
    expect(history.some(h => h.field === "status" && h.from === "Todo" && h.to === "In Progress")).toBe(true)
  })

  it("records status change via updateIssueStatus", () => {
    const issue: Issue = {
      id: "TSK-2",
      title: "Test",
      description: "desc",
      priority: "P2",
      status: "Todo",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
    }
    const state = { issues: [issue] }
    const action = updateIssueStatus({ issueId: "TSK-2", newStatus: "Done" })
const newState = issuesReducer(state, action)
const history = newState.issues[0].history ?? []
expect(history.some(h => h.field === "status" && h.from === "Todo" && h.to === "Done")).toBe(true)
  })

  it("selectIssueHistory returns all changes; selectStatusChangeHistory returns only status changes", () => {
    const issue: Issue = {
      id: "TSK-3",
      title: "A",
      description: "desc",
      priority: "P2",
      status: "Todo",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        { field: "status", from: "Created", to: "Todo", atISO: "2025-01-01T00:00:00Z" },
        { field: "title", from: "A", to: "B", atISO: "2025-01-02T00:00:00Z" },
        { field: "status", from: "Todo", to: "Done", atISO: "2025-01-03T00:00:00Z" },
      ],
    }
    const state = { issues: [issue] }
    expect(selectIssueHistory(state, "TSK-3").length).toBe(3)
    expect(selectStatusChangeHistory(state, "TSK-3").length).toBe(2)
  })
})
