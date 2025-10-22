import type { Issue, Sprint, Priority, IssueStatus, IssueTemplate } from "@/types"

// Priority color mapping
export const priorityColors: Record<Priority, string> = {
  P0: "bg-red-500 text-white",
  P1: "bg-orange-500 text-white",
  P2: "bg-yellow-500 text-black",
  P3: "bg-blue-500 text-white",
  P4: "bg-green-500 text-white",
  P5: "bg-gray-500 text-white",
}

// Status color mapping
export const statusColors: Record<IssueStatus, string> = {
  Todo: "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Done: "bg-green-100 text-green-800 border-green-200",
}

// Generate auto-incrementing task ID
export const generateTaskId = (existingIssues: Issue[]): string => {
  const maxId = existingIssues.reduce((max, issue) => {
    const num = Number.parseInt(issue.id.replace("TSK-", ""))
    return num > max ? num : max
  }, 0)
  return `TSK-${String(maxId + 1).padStart(3, "0")}`
}

// Template definitions and utilities
export const ISSUE_TEMPLATES: Record<string, IssueTemplate> = {
  bug: {
    id: "bug",
    name: "Bug",
    prefix: "[Bug] ",
    isDefault: false,
    defaults: {
      priority: "P1",
      status: "Todo",
      defaultAssigneeUserId: undefined, // Can be set per template
    },
    acceptanceCriteria: [
      "Steps to reproduce defined",
      "Expected vs actual behavior described",
      "Reproduction confirmed",
    ],
  },
  feature: {
    id: "feature",
    name: "Feature",
    prefix: "[Feature] ",
    isDefault: true, // Default template
    defaults: {
      priority: "P3",
      status: "Todo",
      defaultAssigneeUserId: undefined,
    },
    acceptanceCriteria: ["Acceptance scenarios listed", "Non-functional constraints noted", "UX mock agreed"],
  },
  request: {
    id: "request",
    name: "Request",
    prefix: "[Request] ",
    isDefault: false,
    defaults: {
      priority: "P2",
      status: "Todo",
      defaultAssigneeUserId: undefined,
    },
    acceptanceCriteria: ["User impact clarified", "Success criteria measurable", "Approver identified"],
  },
}

// Utility to generate unique AC IDs
export const generateACId = (): string => {
  return `ac-${Math.random().toString(36).slice(2, 11)}`
}

// Utility to apply template to issue data
export const applyIssueTemplate = (templateId: "bug" | "feature" | "request") => {
  const template = ISSUE_TEMPLATES[templateId]
  if (!template) return {}

  return {
    templateId,
    priority: template.defaults.priority,
    status: template.defaults.status,
    defaultAssigneeUserId: template.defaults.defaultAssigneeUserId,
    acceptanceCriteria: template.acceptanceCriteria.map((text) => ({
      id: generateACId(),
      text,
      done: false,
    })),
  }
}

// Utilities for last-used template management
export function getLastUsedTemplate(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("flowcraft:lastUsedTemplate")
  } catch {
    return null
  }
}

export function setLastUsedTemplate(templateId: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("flowcraft:lastUsedTemplate", templateId)
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function getDefaultTemplate(): string {
  // Find the template marked as default, fallback to "feature"
  const defaultTemplate = Object.values(ISSUE_TEMPLATES).find((t) => t.isDefault)
  return defaultTemplate?.id || "feature"
}

// Sample data
