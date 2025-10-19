"use client"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { IssuesList } from "@/components/issues-list"
import { CurrentSprintView } from "@/components/current-sprint-view"
import { SprintsView } from "@/components/sprints-view"
import { ChangelogPanel } from "@/components/changelog-panel"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { WhatsNewModal } from "@/components/whats-new-modal"
import { QuickCapture } from "@/components/quick-capture"
import { IssueForm } from "@/components/issue-form"
import { useToast } from "@/hooks/use-toast"
import { APP_VERSION, hasUnseenUpdates, setLastSeenVersion, getLatestRelease } from "@/lib/changelog"
import { telemetry } from "@/lib/telemetry"
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
import { setCurrentView, setShowWhatsNew, setShowQuickCapture, setHasUnseenUpdates } from "@/lib/redux/slices/uiSlice"
import {
  setSelectedProjects,
  setSelectedTeams,
  clearFilters,
  setDashboardTimeRange,
} from "@/lib/redux/slices/preferencesSlice"

export default function TaskFlowApp() {
  const dispatch: AppDispatch = useDispatch()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { issues } = useSelector((state: RootState) => state.issues)
  const { sprints } = useSelector((state: RootState) => state.sprints)
  const { projects } = useSelector((state: RootState) => state.projects)
  const { teams } = useSelector((state: RootState) => state.teams)
  const { selectedProjectIds, selectedTeamIds, dashboardTimeRange } = useSelector(
    (state: RootState) => state.preferences,
  )
  const {
    currentView,
    showWhatsNew,
    showQuickCapture,
    hasUnseenUpdates: hasUnseen,
  } = useSelector((state: RootState) => state.ui)

  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null)
  const [showIssueEditModal, setShowIssueEditModal] = useState(false)

  useEffect(() => {
    const openParam = searchParams?.get("open")
    const idParam = searchParams?.get("id")

    if (openParam === "quick-capture") {
      const hasOpenModal = document.querySelector('[role="dialog"]') !== null
      if (!hasOpenModal) {
        telemetry.track("quick_capture_opened", { source: "deeplink" })
        dispatch(setShowQuickCapture(true))

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href)
          url.searchParams.delete("open")
          window.history.replaceState({}, "", url.toString())
        }
      }
    } else if (openParam === "issue" && idParam) {
      // Find the issue by ID
      const issue = issues.find((i) => i.id === idParam)
      if (issue) {
        const hasOpenModal = document.querySelector('[role="dialog"]') !== null
        if (!hasOpenModal) {
          telemetry.track("issue_opened_via_deeplink", { issueId: idParam })
          setIssueToEdit(issue)
          setShowIssueEditModal(true)
          dispatch(setCurrentView("issues"))

          if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            url.searchParams.delete("open")
            url.searchParams.delete("id")
            window.history.replaceState({}, "", url.toString())
          }
        }
      }
    }
  }, [searchParams, dispatch, issues])

  useEffect(() => {
    const shouldShow = hasUnseenUpdates(APP_VERSION)
    dispatch(setHasUnseenUpdates(shouldShow))

    if (shouldShow) {
      const timer = setTimeout(() => {
        dispatch(setShowWhatsNew(true))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [dispatch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasOpenModal = document.querySelector('[role="dialog"]') !== null

      if (
        e.key === "q" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable &&
        !hasOpenModal
      ) {
        e.preventDefault()
        telemetry.track("quick_capture_opened", { source: "shortcut" })
        dispatch(setShowQuickCapture(true))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dispatch])

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
    const createdIssue = dispatch(addIssue(issueData))

    if (createdIssue.payload) {
      const issue = createdIssue.payload as Issue
      const titlePreview = issue.title.length > 40 ? issue.title.substring(0, 40) + "..." : issue.title

      toast({
        title: "Issue Created",
        description: (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {issue.id} — {titlePreview}
            </span>
            <a
              href={`?open=issue&id=${issue.id}`}
              onClick={(e) => {
                e.preventDefault()
                setIssueToEdit(issue)
                setShowIssueEditModal(true)
                dispatch(setCurrentView("issues"))
              }}
              className="text-blue-500 hover:underline text-left"
            >
              Open →
            </a>
          </div>
        ),
        duration: 6000,
      })
    }
  }

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

  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const getSprintContext = (): string => {
    if (currentView === "current-sprint" && activeSprint) {
      return "currentSprint"
    }
    return "none"
  }

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
      case "dashboard":
        return (
          <DashboardView
            issues={issues}
            sprints={sprints}
            projects={projects}
            teams={teams}
            selectedProjectIds={selectedProjectIds}
            selectedTeamIds={selectedTeamIds}
            timeRange={dashboardTimeRange}
            onProjectsChange={(ids) => dispatch(setSelectedProjects(ids))}
            onTeamsChange={(ids) => dispatch(setSelectedTeams(ids))}
            onClearFilters={() => dispatch(clearFilters())}
            onTimeRangeChange={(range) => dispatch(setDashboardTimeRange(range))}
          />
        )
      case "changelog":
        return <ChangelogPanel onNavigate={handleNavigateFromWhatsNew} />
      default:
        return null
    }
  }

  const latestRelease = getLatestRelease()

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

  const handleCloseIssueEditModal = () => {
    setShowIssueEditModal(false)
    setIssueToEdit(null)
  }

  const handleSaveEditedIssue = (updatedIssue: Issue) => {
    dispatch(updateIssue(updatedIssue))
    handleCloseIssueEditModal()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={(view) => dispatch(setCurrentView(view))}
        issues={issues}
        sprints={sprints}
        hasUnseenUpdates={hasUnseen}
        onWhatsNewClick={() => dispatch(setShowWhatsNew(true))}
        onQuickAddClick={() => {
          telemetry.track("quick_capture_opened", { source: "button" })
          dispatch(setShowQuickCapture(true))
        }}
      />
      <main className="container mx-auto px-4 py-8">{renderCurrentView()}</main>

      <QuickCapture
        open={showQuickCapture}
        onOpenChange={(open) => dispatch(setShowQuickCapture(open))}
        sprints={sprints}
        onSubmit={handleQuickCreateIssue}
        sprintContext={getSprintContext()}
        source="button"
      />

      {issueToEdit && (
        <IssueForm
          open={showIssueEditModal}
          onOpenChange={handleCloseIssueEditModal}
          sprints={sprints}
          projects={projects} // Added projects prop
          teams={teams} // Added teams prop
          onSubmit={handleSaveEditedIssue}
          issue={issueToEdit}
        />
      )}

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
