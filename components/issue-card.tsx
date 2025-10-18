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
import type { Issue, Sprint } from "@/types"

interface IssueCardProps {
  issue: Issue
  sprints: Sprint[]
  onEdit: (issue: Issue) => void
  onDelete: (issueId: string) => void
  onAssignToSprint: (issueId: string, sprintId: string | undefined) => void
  showSprint?: boolean
}

export function IssueCard({ issue, sprints, onEdit, onDelete, onAssignToSprint, showSprint = true }: IssueCardProps) {
  const sprint = sprints.find((s) => s.id === issue.sprintId)

  const acProgress = issue.acceptanceCriteria
    ? {
        completed: issue.acceptanceCriteria.filter((ac) => ac.done).length,
        total: issue.acceptanceCriteria.length,
      }
    : null

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                onSubmit={onEdit}
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
                      Are you sure you want to delete "{issue.title}"? This action cannot be undone.
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
          <div className="flex items-center gap-2">
            <Badge className={statusColors[issue.status]} variant="outline">
              {issue.status}
            </Badge>
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
          <span className="text-xs text-muted-foreground">{issue.assignee}</span>
        </div>
      </CardContent>
    </Card>
  )
}
