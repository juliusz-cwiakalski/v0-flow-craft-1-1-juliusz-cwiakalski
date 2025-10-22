"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import { selectAllUsers } from "@/lib/redux/slices/usersSlice"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
import { priorityColors } from "@/lib/data"
import type { Issue, IssueStatus, Sprint, Project, Team } from "@/types"

interface KanbanBoardProps {
  sprint: Sprint
  issues: Issue[]
  sprints: Sprint[]
  projects?: Project[] // Added projects prop
  teams?: Team[] // Added teams prop
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
  onEdit: (issue: Issue) => void
  onDelete: (issueId: string) => void
}

const columns: { id: IssueStatus; title: string; color: string }[] = [
  { id: "Todo", title: "Todo", color: "bg-gray-50 border-gray-200" },
  { id: "In Progress", title: "In Progress", color: "bg-blue-50 border-blue-200" },
  { id: "In Review", title: "In Review", color: "bg-yellow-50 border-yellow-200" },
  { id: "Done", title: "Done", color: "bg-green-50 border-green-200" },
]

export function KanbanBoard({
  sprint,
  issues,
  sprints,
  projects = [], // Default to empty array
  teams = [], // Default to empty array
  onUpdateIssueStatus,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false)
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([])
  const users = useSelector((state: RootState) => selectAllUsers(state))
  const userNameById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.name])), [users])

  useEffect(() => {
    setMounted(true)
    setSprintIssues(issues.filter((issue) => issue.sprintId === sprint.id))
  }, [issues, sprint.id])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const getAcProgress = (issue: Issue) => {
    if (!issue.acceptanceCriteria) return null
    return {
      completed: issue.acceptanceCriteria.filter((ac) => ac.done).length,
      total: issue.acceptanceCriteria.length,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">{sprint.name}</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
          {sprintIssues.length} issues
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnIssues = sprintIssues.filter((issue) => issue.status === column.id)

          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnIssues.length}
                </Badge>
              </div>

              <div className={`min-h-[200px] p-3 rounded-lg border-2 ${column.color}`}>
                <div className="space-y-3">
                  {columnIssues.map((issue) => {
                    const acProgress = getAcProgress(issue)

                    return (
                      <Card key={issue.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
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
                              <h4 className="font-medium text-sm leading-tight line-clamp-2">{issue.title}</h4>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                                  <span className="text-base">⋯</span>
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
                                      <AlertDialogAction
                                        onClick={() => onDelete(issue.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
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
                          {issue.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">{userNameById[issue.assigneeUserId || ""] || "Unassigned"}</span>
                          </div>

                          <Select
                            value={issue.status}
                            onValueChange={(newStatus: IssueStatus) => onUpdateIssueStatus(issue.id, newStatus)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Todo">Todo</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="In Review">In Review</SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sprintIssues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No issues assigned to this sprint yet.</p>
        </div>
      )}
    </div>
  )
}
