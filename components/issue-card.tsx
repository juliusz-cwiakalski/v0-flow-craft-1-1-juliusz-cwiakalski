"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IssueForm } from "./issue-form"
import { IssueAssignmentDialog } from "./issue-assignment-dialog"
import { priorityColors, statusColors } from "@/lib/data"
import { telemetry } from "@/lib/telemetry"
import type { Issue, Sprint, Project, Team } from "@/types"
import { useSelector } from "react-redux"
import { selectUserById } from "@/lib/redux/slices/usersSlice"
import type { RootState } from "@/lib/redux/store"

interface IssueCardProps {
  issue: Issue
  sprints: Sprint[]
  projects?: Project[] // Added projects prop
  teams?: Team[] // Added teams prop
  onEdit: (issue: Issue) => void
  onDelete: (issueId: string) => void
  onAssignToSprint: (issueId: string, sprintId: string | undefined) => void
  showSprint?: boolean
}

export function IssueCard({
  issue,
  sprints,
  projects = [], // Default to empty array
  teams = [], // Default to empty array
  onEdit,
  onDelete,
  onAssignToSprint,
  showSprint = true,
}: IssueCardProps) {
  // Source projects/teams from Redux if not provided or empty
  const reduxProjects = useSelector((state: RootState) => state.projects.projects)
  const reduxTeams = useSelector((state: RootState) => state.teams.teams)
  const effectiveProjects = projects.length > 0 ? projects : reduxProjects
  const effectiveTeams = teams.length > 0 ? teams : reduxTeams
  const projectNameById = Object.fromEntries(effectiveProjects.map(p => [p.id, p.name]))
  const teamNameById = Object.fromEntries(effectiveTeams.map(t => [t.id, t.name]))
  const sprint = sprints.find((s) => s.id === issue.sprintId)
  const assignee = useSelector((state: RootState) =>
    issue.assigneeUserId ? selectUserById(state, issue.assigneeUserId) : undefined,
  )

  const acProgress = issue.acceptanceCriteria
    ? {
        completed: issue.acceptanceCriteria.filter((ac) => ac.done).length,
        total: issue.acceptanceCriteria.length,
      }
    : null

  const handleCardView = () => {
    if (acProgress && acProgress.total > 0) {
      telemetry.track("ac_badge_viewed", { issueId: issue.id })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow" onMouseEnter={handleCardView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">{issue.id}</span>
              <Badge className={priorityColors[issue.priority]} variant="secondary">
                {issue.priority}
              </Badge>
              {acProgress && acProgress.total > 0 && (
                <Badge
                  variant={acProgress.completed === acProgress.total ? "default" : "secondary"}
                  className={
                    acProgress.completed === acProgress.total
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-700"
                  }
                  title="Acceptance Criteria completed"
                >
                  AC {acProgress.completed}/{acProgress.total}
                </Badge>
              )}
            </div>
            <h3 className="font-medium leading-tight">{issue.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="text-lg">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <IssueForm
                issue={issue}
                sprints={sprints}
                projects={projects} // Pass projects prop
                teams={teams} // Pass teams prop
                onSubmit={(data) => onEdit(data as Issue)}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="mr-2">✏️</span>
                    Edit
                  </DropdownMenuItem>
                }
              />
              <IssueAssignmentDialog
                issue={issue}
                sprints={sprints}
                onAssign={onAssignToSprint}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="mr-2">↕️</span>
                    Assign to Sprint
                  </DropdownMenuItem>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="mr-2">🗑️</span>
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{issue.title}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(issue.id)} className="bg-red-500 hover:bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {issue.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[issue.status]} variant="outline">
              {issue.status}
            </Badge>
{issue.projectId && (
  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
    📁 {projectNameById[issue.projectId] || issue.projectId}
  </Badge>
)}
            {!issue.projectId && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                📁 Unassigned
              </Badge>
            )}
{issue.teamId && (
  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
    👥 {teamNameById[issue.teamId] || issue.teamId}
  </Badge>
)}
            {!issue.teamId && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                👥 Unassigned
              </Badge>
            )}
            {showSprint && sprint && (
              <Badge variant="secondary" className="text-xs">
                {sprint.name}
              </Badge>
            )}
            {showSprint && !sprint && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Backlog
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{assignee?.name || "Unassigned"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
