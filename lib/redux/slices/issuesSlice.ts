import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Issue, IssueStatus } from "@/types"
import { initialIssues, generateTaskId } from "@/lib/data"

interface IssuesState {
  issues: Issue[]
}

const initialState: IssuesState = {
  issues: initialIssues,
}

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    addIssue(state, action: PayloadAction<Partial<Issue>>) {
      const newIssue: Issue = {
        id: generateTaskId(state.issues),
        title: action.payload.title || "",
        description: action.payload.description || "",
        priority: action.payload.priority || "P3",
        status: action.payload.status || "Todo",
        assigneeUserId: action.payload.assigneeUserId,
        sprintId: action.payload.sprintId,
        projectId: action.payload.projectId,
        teamId: action.payload.teamId,
        templateId: action.payload.templateId,
        acceptanceCriteria: action.payload.acceptanceCriteria,
        statusChangeHistory: [
          {
            from: "Created",
            to: action.payload.status || "Todo",
            atISO: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.issues.push(newIssue)
    },
    updateIssue(state, action: PayloadAction<Issue>) {
      const index = state.issues.findIndex((issue) => issue.id === action.payload.id)
      if (index !== -1) {
        const oldIssue = state.issues[index]
        const newIssue = action.payload

        if (oldIssue.status !== newIssue.status) {
          const history = oldIssue.statusChangeHistory || []
          newIssue.statusChangeHistory = [
            ...history,
            {
              from: oldIssue.status,
              to: newIssue.status,
              atISO: new Date().toISOString(),
            },
          ]
        }

        state.issues[index] = {
          ...newIssue,
          updatedAt: new Date(),
        }
      }
    },
    deleteIssue(state, action: PayloadAction<string>) {
      state.issues = state.issues.filter((issue) => issue.id !== action.payload)
    },
    updateIssueStatus(state, action: PayloadAction<{ issueId: string; newStatus: IssueStatus }>) {
      const issue = state.issues.find((issue) => issue.id === action.payload.issueId)
      if (issue) {
        const history = issue.statusChangeHistory || []
        issue.statusChangeHistory = [
          ...history,
          {
            from: issue.status,
            to: action.payload.newStatus,
            atISO: new Date().toISOString(),
          },
        ]
        issue.status = action.payload.newStatus
        issue.updatedAt = new Date()
      }
    },
    assignIssueToSprint(state, action: PayloadAction<{ issueId: string; sprintId: string | undefined }>) {
      const issue = state.issues.find((issue) => issue.id === action.payload.issueId)
      if (issue) {
        issue.sprintId = action.payload.sprintId
        issue.updatedAt = new Date()
      }
    },
    moveUnfinishedIssuesToBacklog(state, action: PayloadAction<string>) {
      const sprintId = action.payload
      state.issues.forEach((issue) => {
        if (issue.sprintId === sprintId && issue.status !== "Done") {
          issue.sprintId = undefined
          issue.updatedAt = new Date()
        }
      })
    },
  },
})

export const {
  addIssue,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  assignIssueToSprint,
  moveUnfinishedIssuesToBacklog,
} = issuesSlice.actions
export default issuesSlice.reducer
