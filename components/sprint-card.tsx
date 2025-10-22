"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SprintForm } from "./sprint-form"
import type { Sprint, Issue } from "@/types"

interface SprintCardProps {
  sprint: Sprint
  issues: Issue[]
  onEdit: (sprint: Sprint) => void
  onStart: (sprintId: string) => void
  onEnd: (sprintId: string) => void
  canStart: boolean
}

export function SprintCard({ sprint, issues, onEdit, onStart, onEnd, canStart }: SprintCardProps) {
  const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.id)
  const completedIssues = sprintIssues.filter((issue) => issue.status === "Done")

  const getStatusColor = () => {
    switch (sprint.status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Planned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{sprint.name}</h3>
              <Badge className={getStatusColor()} variant="outline">
                {sprint.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>📅</span>
              <span>
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="text-lg">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SprintForm
                sprint={sprint}
                onSubmit={(data) => onEdit({ ...sprint, ...data })}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="mr-2">✏️</span>
                    Edit
                  </DropdownMenuItem>
                }
              />
              {sprint.status === "Planned" && (
                <DropdownMenuItem onClick={() => onStart(sprint.id)} disabled={!canStart}>
                  <span className="mr-2">▶️</span>
                  Start Sprint
                </DropdownMenuItem>
              )}
              {sprint.status === "Active" && (
                <DropdownMenuItem onClick={() => onEnd(sprint.id)}>
                  <span className="mr-2">⏹️</span>
                  End Sprint
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Issues</span>
            <span className="font-medium">
              {completedIssues.length} / {sprintIssues.length} completed
            </span>
          </div>
          {sprintIssues.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedIssues.length / sprintIssues.length) * 100}%`,
                }}
              />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {sprintIssues.length === 0 ? "No issues assigned" : `${sprintIssues.length} issues in this sprint`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
