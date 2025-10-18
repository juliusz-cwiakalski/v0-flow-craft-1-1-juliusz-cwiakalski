// Changelog data structure and content

// Application version for changelog tracking
export const APP_VERSION = "0.1.0"

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
    version: "0.1.0",
    dateISO: "2025-01-18",
    items: [
      {
        id: "quick-capture",
        kind: "New",
        title: "Quick Capture + Templates",
        summary:
          'Press Q or click "Quick Add" to create issues instantly. Use Bug/Feature/Request templates with ready Acceptance Criteria to standardize quality.',
        cta: {
          label: "Try Quick Capture",
        },
        deeplink: {
          view: "issues",
        },
        howToFind: 'Press Q anywhere or click the "New Issue" button in the Issues view',
      },
      {
        id: "full-export",
        kind: "New",
        title: "Full Data Export (JSON/CSV)",
        summary: "Export Issues and Sprints in one click to JSON/CSV. Build trust with guaranteed portability.",
        cta: {
          label: "Learn More",
        },
        howToFind: "Top navigation → Export → choose format (Coming soon)",
      },
      {
        id: "dashboard",
        kind: "New",
        title: "Roll-up Dashboard (Lite)",
        summary: "Bird's-eye view with status breakdown, active sprint progress, and 7-day throughput.",
        cta: {
          label: "View Dashboard",
        },
        howToFind: "Dashboard view in top navigation (Coming soon)",
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
