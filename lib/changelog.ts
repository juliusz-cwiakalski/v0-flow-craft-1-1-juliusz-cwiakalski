// Changelog data structure and content

// Application version for changelog tracking
export const APP_VERSION = "0.2.0"

export type ReleaseItemKind = "New" | "Improved" | "Fixed" | "Notice"

export interface ReleaseItem {
  id: string
  kind: ReleaseItemKind
  title: string
  summary: string
  cta?: {
    label: string
    href?: string
  }
  deeplink?: {
    view: "issues" | "current-sprint" | "sprints" | "changelog"
    query?: Record<string, string>
  }
  howToFind?: string
}

export interface Release {
  version: string
  dateISO: string
  items: ReleaseItem[]
}

// Release content (newest first)
export const releases: Release[] = [
  {
    version: "0.2.0",
    dateISO: "2025-01-18",
    items: [
      {
        id: "quick-capture",
        kind: "New",
        title: "Quick Capture + Templates",
        summary:
          'Press Q or click "Quick Add" to create issues in ≤10 seconds. Choose Bug, Feature, or Request templates with pre-filled Acceptance Criteria to standardize task quality and reduce coordination overhead.',
        cta: {
          label: "Try Quick Capture",
        },
        deeplink: {
          view: "issues",
        },
        howToFind:
          'Press Q anywhere (when no input is focused) or click the blue "Quick Add" button in the top navigation',
      },
      {
        id: "acceptance-criteria",
        kind: "New",
        title: "Acceptance Criteria Management",
        summary:
          "Define and track Acceptance Criteria (AC) for each issue. Issue cards show AC progress badges (e.g., AC 2/3). Edit AC in the Issue Form with checkboxes to mark completion.",
        cta: {
          label: "View Issues",
        },
        deeplink: {
          view: "issues",
        },
        howToFind:
          "Create or edit any issue to add/manage Acceptance Criteria. Progress badges appear on issue cards automatically.",
      },
      {
        id: "templates",
        kind: "New",
        title: "Issue Templates (Bug, Feature, Request)",
        summary:
          "Three built-in templates auto-fill priority, status, and AC. Bug template includes reproduction steps, Feature includes acceptance scenarios, Request includes impact clarification.",
        howToFind: 'Select a template in Quick Capture or when creating a new issue via "Create Issue" button',
      },
    ],
  },
  {
    version: "0.1.0",
    dateISO: "2025-01-17",
    items: [
      {
        id: "initial-release",
        kind: "New",
        title: "FlowCraft Launch",
        summary:
          "Task management with Issues, Sprints, and Kanban board. Create, edit, and organize tasks across multiple sprints with priority and status tracking.",
        cta: {
          label: "Get Started",
        },
        deeplink: {
          view: "issues",
        },
        howToFind: "Navigate using the top menu to explore Issues, Current Sprint, and Sprints views",
      },
    ],
  },
]

// Helper functions for version management
export function getLastSeenVersion(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("flowcraft:lastSeenVersion")
  } catch {
    return null
  }
}

export function setLastSeenVersion(version: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("flowcraft:lastSeenVersion", version)
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function hasUnseenUpdates(currentVersion: string): boolean {
  const lastSeen = getLastSeenVersion()
  return lastSeen !== currentVersion
}

export function getLatestRelease(): Release | undefined {
  return releases[0]
}
