import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Issue, IssueStatus } from "@/types"
import { generateTaskId } from "@/lib/data"
import { demoIssues as initialIssues } from "@/lib/demo-data"

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
         history: [
           {
             field: "status",
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

         // Track changes for all relevant fields
         const fieldsToCheck = [
           "title", "description", "priority", "status", "assigneeUserId", "sprintId", "projectId", "teamId", "templateId", "acceptanceCriteria"
         ]
         const history = oldIssue.history || []
         let newHistory = [...history]
         fieldsToCheck.forEach(field => {
           if (JSON.stringify((oldIssue as any)[field]) !== JSON.stringify((newIssue as any)[field])) {
             newHistory.push({
               field,
               from: (oldIssue as any)[field],
               to: (newIssue as any)[field],
               atISO: new Date().toISOString(),
             })
           }
         })
         state.issues[index] = {
           ...newIssue,
           history: newHistory,
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
         const history = issue.history || []
         issue.history = [
           ...history,
           {
             field: "status",
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
export const selectIssueHistory = (state: IssuesState, issueId: string) => {
  const issue = state.issues.find(i => i.id === issueId)
  return issue?.history || []
}

export const selectStatusChangeHistory = (state: IssuesState, issueId: string) => {
  const issue = state.issues.find(i => i.id === issueId)
  return (issue?.history || []).filter(h => h.field === "status")
}

export default issuesSlice.reducer
