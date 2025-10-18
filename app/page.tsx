"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { IssuesList } from "@/components/issues-list"
import { CurrentSprintView } from "@/components/current-sprint-view"
import { SprintsView } from "@/components/sprints-view"
import { ChangelogPanel } from "@/components/changelog-panel"
import { WhatsNewModal } from "@/components/whats-new-modal"
import { QuickCapture } from "@/components/quick-capture" // Added QuickCapture import
import { initialIssues, initialSprints, generateTaskId } from "@/lib/data"
import { APP_VERSION, hasUnseenUpdates, setLastSeenVersion, getLatestRelease } from "@/lib/changelog"
import type { Issue, Sprint, ViewType, IssueStatus } from "@/types"

export default function TaskFlowApp() {
  const [currentView, setCurrentView] = useState<ViewType>("issues")
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false) // Added quick capture state
  const [hasUnseen, setHasUnseen] = useState(false)

  useEffect(() => {
    const shouldShow = hasUnseenUpdates(APP_VERSION)
    setHasUnseen(shouldShow)

    if (shouldShow) {
      // Delay to ensure smooth initial render
      const timer = setTimeout(() => {
        setShowWhatsNew(true)
      }, 500)
      return () => clearTimeout(timer)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Q is pressed and no input is focused
      if (
        e.key === "q" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault()
        setShowQuickCapture(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleWhatsNewDismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setLastSeenVersion(APP_VERSION)
      setHasUnseen(false)
    }
  }

  const handleNavigateFromWhatsNew = (view: string) => {
    if (view === "issues" || view === "current-sprint" || view === "sprints" || view === "changelog") {
      setCurrentView(view as ViewType)
    }
  }

  const handleViewChangelog = () => {
    setCurrentView("changelog")
    setShowWhatsNew(false)
  }

  // Issue management functions
  const handleCreateIssue = (issueData: Partial<Issue>) => {
    const newIssue: Issue = {
      id: generateTaskId(issues),
      title: issueData.title || "",
      description: issueData.description || "",
      priority: issueData.priority || "P3",
      status: issueData.status || "Todo",
      assignee: issueData.assignee || "",
      sprintId: issueData.sprintId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setIssues([...issues, newIssue])
  }

  const handleEditIssue = (updatedIssue: Issue) => {
    setIssues(
      issues.map((issue) =>
        issue.id === updatedIssue.id
          ? {
              ...issue,
              ...updatedIssue,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleDeleteIssue = (issueId: string) => {
    setIssues(issues.filter((issue) => issue.id !== issueId))
  }

  const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleAssignToSprint = (issueId: string, sprintId: string | undefined) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              sprintId,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleQuickCreateIssue = (issueData: Partial<Issue>) => {
    const newIssue: Issue = {
      id: generateTaskId(issues),
      title: issueData.title || "",
      description: issueData.description || "",
      priority: issueData.priority || "P3",
      status: issueData.status || "Todo",
      assignee: issueData.assignee || "",
      sprintId: issueData.sprintId,
      templateId: issueData.templateId,
      acceptanceCriteria: issueData.acceptanceCriteria,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setIssues([...issues, newIssue])
  }

  // Sprint management functions
  const handleCreateSprint = (sprintData: Partial<Sprint>) => {
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: sprintData.name || "",
      status: "Planned",
      startDate: sprintData.startDate || new Date(),
      endDate: sprintData.endDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSprints([...sprints, newSprint])
  }

  const handleEditSprint = (updatedSprint: Sprint) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === updatedSprint.id
          ? {
              ...sprint,
              ...updatedSprint,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleStartSprint = (sprintId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Active" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleEndSprint = (sprintId: string) => {
    // Move unfinished issues back to backlog
    const unfinishedIssues = issues.filter((issue) => issue.sprintId === sprintId && issue.status !== "Done")

    setIssues(
      issues.map((issue) =>
        unfinishedIssues.some((ui) => ui.id === issue.id)
          ? {
              ...issue,
              sprintId: undefined,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )

    // Update sprint status
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Completed" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  // Get current active sprint
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const renderCurrentView = () => {
    switch (currentView) {
      case "issues":
        return (
          <IssuesList
            issues={issues}
            sprints={sprints}
            onCreateIssue={handleCreateIssue}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            onAssignToSprint={handleAssignToSprint}
          />
        )
      case "current-sprint":
        return (
          <CurrentSprintView
            sprint={activeSprint || null}
            sprints={sprints}
            issues={issues}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onEdit={handleEditIssue}
            onDelete={handleDeleteIssue}
          />
        )
      case "sprints":
        return (
          <SprintsView
            sprints={sprints}
            issues={issues}
            onCreateSprint={handleCreateSprint}
            onEditSprint={handleEditSprint}
            onStartSprint={handleStartSprint}
            onEndSprint={handleEndSprint}
          />
        )
      case "changelog":
        return <ChangelogPanel onNavigate={handleNavigateFromWhatsNew} />
      default:
        return null
    }
  }

  const latestRelease = getLatestRelease()

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        issues={issues}
        sprints={sprints}
        hasUnseenUpdates={hasUnseen}
        onWhatsNewClick={() => setShowWhatsNew(true)}
        onQuickAddClick={() => setShowQuickCapture(true)} // Added quick add handler
      />
      <main className="container mx-auto px-4 py-8">{renderCurrentView()}</main>

      <QuickCapture
        open={showQuickCapture}
        onOpenChange={setShowQuickCapture}
        sprints={sprints}
        onSubmit={handleQuickCreateIssue}
      />

      {latestRelease && (
        <WhatsNewModal
          open={showWhatsNew}
          onOpenChange={setShowWhatsNew}
          release={latestRelease}
          onDismiss={handleWhatsNewDismiss}
          onNavigate={handleNavigateFromWhatsNew}
          onViewChangelog={handleViewChangelog}
        />
      )}
    </div>
  )
}
