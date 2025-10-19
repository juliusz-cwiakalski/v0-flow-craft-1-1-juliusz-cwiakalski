"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Navigation } from "@/components/navigation"
import { IssuesList } from "@/components/issues-list"
import { CurrentSprintView } from "@/components/current-sprint-view"
import { SprintsView } from "@/components/sprints-view"
import { ChangelogPanel } from "@/components/changelog-panel"
import { WhatsNewModal } from "@/components/whats-new-modal"
import { QuickCapture } from "@/components/quick-capture"
import { APP_VERSION, hasUnseenUpdates, setLastSeenVersion, getLatestRelease } from "@/lib/changelog"
import type { Issue, Sprint, ViewType, IssueStatus } from "@/types"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import {
  addIssue,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  assignIssueToSprint,
  moveUnfinishedIssuesToBacklog,
} from "@/lib/redux/slices/issuesSlice"
import { addSprint, updateSprint, startSprint, endSprint } from "@/lib/redux/slices/sprintsSlice"
import {
  setCurrentView,
  setShowWhatsNew,
  setShowQuickCapture,
  setHasUnseenUpdates,
} from "@/lib/redux/slices/uiSlice"

export default function TaskFlowApp() {
  const dispatch: AppDispatch = useDispatch()
  const { issues } = useSelector((state: RootState) => state.issues)
  const { sprints } = useSelector((state: RootState) => state.sprints)
  const {
    currentView,
    showWhatsNew,
    showQuickCapture,
    hasUnseenUpdates: hasUnseen,
  } = useSelector((state: RootState) => state.ui)

  useEffect(() => {
    const shouldShow = hasUnseenUpdates(APP_VERSION)
    dispatch(setHasUnseenUpdates(shouldShow))

    if (shouldShow) {
      // Delay to ensure smooth initial render
      const timer = setTimeout(() => {
        dispatch(setShowWhatsNew(true))
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
        dispatch(setShowQuickCapture(true))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dispatch])

  const handleWhatsNewDismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setLastSeenVersion(APP_VERSION)
      dispatch(setHasUnseenUpdates(false))
    }
  }

  const handleNavigateFromWhatsNew = (view: string) => {
    if (view === "issues" || view === "current-sprint" || view === "sprints" || view === "changelog") {
      dispatch(setCurrentView(view as ViewType))
    }
  }

  const handleViewChangelog = () => {
    dispatch(setCurrentView("changelog"))
    dispatch(setShowWhatsNew(false))
  }

  // Issue management functions
  const handleCreateIssue = (issueData: Partial<Issue>) => {
    dispatch(addIssue(issueData))
  }

  const handleEditIssue = (updatedIssue: Issue) => {
    dispatch(updateIssue(updatedIssue))
  }

  const handleDeleteIssue = (issueId: string) => {
    dispatch(deleteIssue(issueId))
  }

  const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    dispatch(updateIssueStatus({ issueId, newStatus }))
  }

  const handleAssignToSprint = (issueId: string, sprintId: string | undefined) => {
    dispatch(assignIssueToSprint({ issueId, sprintId }))
  }

  const handleQuickCreateIssue = (issueData: Partial<Issue>) => {
    dispatch(addIssue(issueData))
  }

  // Sprint management functions
  const handleCreateSprint = (sprintData: Partial<Sprint>) => {
    dispatch(addSprint(sprintData))
  }

  const handleEditSprint = (updatedSprint: Sprint) => {
    dispatch(updateSprint(updatedSprint))
  }

  const handleStartSprint = (sprintId: string) => {
    dispatch(startSprint(sprintId))
  }

  const handleEndSprint = (sprintId: string) => {
    dispatch(moveUnfinishedIssuesToBacklog(sprintId))
    dispatch(endSprint(sprintId))
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
        onViewChange={(view) => dispatch(setCurrentView(view))}
        issues={issues}
        sprints={sprints}
        hasUnseenUpdates={hasUnseen}
        onWhatsNewClick={() => dispatch(setShowWhatsNew(true))}
        onQuickAddClick={() => dispatch(setShowQuickCapture(true))}
      />
      <main className="container mx-auto px-4 py-8">{renderCurrentView()}</main>

      <QuickCapture
        open={showQuickCapture}
        onOpenChange={(open) => dispatch(setShowQuickCapture(open))}
        sprints={sprints}
        onSubmit={handleQuickCreateIssue}
      />

      {latestRelease && (
        <WhatsNewModal
          open={showWhatsNew}
          onOpenChange={(open) => dispatch(setShowWhatsNew(open))}
          release={latestRelease}
          onDismiss={handleWhatsNewDismiss}
          onNavigate={handleNavigateFromWhatsNew}
          onViewChangelog={handleViewChangelog}
        />
      )}
    </div>
  )
}
