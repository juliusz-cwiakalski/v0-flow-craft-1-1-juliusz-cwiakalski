export type Priority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5"
export type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done"
export type SprintStatus = "Planned" | "Active" | "Completed"

export interface Issue {
  id: string
  title: string
  description: string
  priority: Priority
  status: IssueStatus
  assignee: string
  sprintId?: string
  projectId?: string
  teamId?: string
  templateId?: "bug" | "feature" | "request"
  acceptanceCriteria?: AcceptanceCriterion[]
  statusChangeHistory?: StatusChangeEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface AcceptanceCriterion {
  id: string
  text: string
  done: boolean
}

export interface IssueTemplate {
  id: "bug" | "feature" | "request"
  name: string
  prefix: string
  isDefault?: boolean // Added isDefault flag
  defaults: {
    priority: Priority
    status: IssueStatus
    defaultAssignee?: string
  }
  acceptanceCriteria: string[]
}

export interface Sprint {
  id: string
  name: string
  status: SprintStatus
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface StatusChangeEntry {
  from: IssueStatus | "Created"
  to: IssueStatus
  atISO: string
}

export interface Project {
  id: string
  name: string
  createdAt: Date
}

export interface Team {
  id: string
  name: string
  createdAt: Date
}

export type TimeRangePreset = "7d" | "14d" | "30d" | "custom"

export interface DashboardTimeRange {
  preset: TimeRangePreset
  fromISO?: string
  toISO?: string
}

export interface PreferencesState {
  selectedProjectIds: string[]
  selectedTeamIds: string[]
  lastUsedProjectId?: string
  lastUsedTeamId?: string
  dashboardTimeRange: DashboardTimeRange
}

export type ViewType = "issues" | "current-sprint" | "sprints" | "changelog" | "dashboard"
