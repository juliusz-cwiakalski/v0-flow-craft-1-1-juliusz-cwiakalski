"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "./kanban-board"
import type { Issue, Sprint, IssueStatus } from "@/types"

import { ScopeFilters } from "@/components/scope-filters"
import type { Project, Team } from "@/types"

interface CurrentSprintViewProps {
  sprint: Sprint | null
  sprints: Sprint[]
  issues: Issue[]
  projects: Project[]
  teams: Team[]
  selectedProjectIds: string[]
  selectedTeamIds: string[]
  onProjectsChange: (ids: string[]) => void
  onTeamsChange: (ids: string[]) => void
  onClearFilters: () => void
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
  onEdit: (issue: Issue) => void
  onDelete: (issueId: string) => void
}

export function CurrentSprintView({
  sprint,
  sprints,
  issues,
  projects,
  teams,
  selectedProjectIds,
  selectedTeamIds,
  onProjectsChange,
  onTeamsChange,
  onClearFilters,
  onUpdateIssueStatus,
  onEdit,
  onDelete,
}: CurrentSprintViewProps) {
  if (!sprint) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Current Sprint</h1>
        {/* Scope Filters for Projects/Teams */}
        <ScopeFilters
          projects={projects}
          teams={teams}
          selectedProjectIds={selectedProjectIds}
          selectedTeamIds={selectedTeamIds}
          onProjectsChange={onProjectsChange}
          onTeamsChange={onTeamsChange}
          onClearFilters={onClearFilters}
        />
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No Active Sprint</h3>
          <p className="text-muted-foreground">Start a sprint from the Sprints view to see the kanban board here.</p>
        </div>
      </div>
    )
  }

  // Apply scope filters for Projects/Teams
  const scopeFilteredIssues = issues.filter((issue) => {
    const matchesProject = selectedProjectIds.length === 0 || (issue.projectId && selectedProjectIds.includes(issue.projectId))
    const matchesTeam = selectedTeamIds.length === 0 || (issue.teamId && selectedTeamIds.includes(issue.teamId))
    return matchesProject && matchesTeam
  })

  const sprintIssues = scopeFilteredIssues.filter((issue) => issue.sprintId === sprint.id)
  const completedIssues = sprintIssues.filter((issue) => issue.status === "Done")
  const inProgressIssues = sprintIssues.filter((issue) => issue.status === "In Progress")
  const inReviewIssues = sprintIssues.filter((issue) => issue.status === "In Review")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const endDate = new Date(sprint.endDate)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Current Sprint</h1>
        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
          Active
        </Badge>
      </div>

      {/* Scope Filters for Projects/Teams */}
      <ScopeFilters
        projects={projects}
        teams={teams}
        selectedProjectIds={selectedProjectIds}
        selectedTeamIds={selectedTeamIds}
        onProjectsChange={onProjectsChange}
        onTeamsChange={onTeamsChange}
        onClearFilters={onClearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            {sprint.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  {completedIssues.length} of {sprintIssues.length} issues completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm font-medium">Time Remaining</p>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining > 0 ? `${daysRemaining} days left` : "Sprint ended"}
                </p>
              </div>
            </div>
          </div>

          {sprintIssues.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sprint Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((completedIssues.length / sprintIssues.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedIssues.length / sprintIssues.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sprintIssues.filter((i) => i.status === "Todo").length}
              </div>
              <div className="text-sm text-muted-foreground">Todo</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressIssues.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{inReviewIssues.length}</div>
              <div className="text-sm text-muted-foreground">In Review</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedIssues.length}</div>
              <div className="text-sm text-muted-foreground">Done</div>
            </div>
          </CardContent>
        </Card>
      </div>

<KanbanBoard
         sprint={sprint}
         issues={sprintIssues}
         sprints={sprints}
         projects={projects}
         teams={teams}
         onUpdateIssueStatus={onUpdateIssueStatus}
         onEdit={onEdit}
         onDelete={onDelete}
       />
    </div>
  )
}
