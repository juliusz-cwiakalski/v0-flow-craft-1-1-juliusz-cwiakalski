"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IssueCard } from "./issue-card"
import { IssueForm } from "./issue-form"
import type { Issue, Sprint, Priority, IssueStatus, Project, Team } from "@/types"
import { selectAllUsers } from "@/lib/redux/slices/usersSlice"
import type { RootState } from "@/lib/redux/store"

interface IssuesListProps {
  issues: Issue[]
  sprints: Sprint[]
  projects: Project[]
  teams: Team[]
  selectedProjectIds: string[]
  selectedTeamIds: string[]
  onProjectsChange: (ids: string[]) => void
  onTeamsChange: (ids: string[]) => void
  onClearFilters: () => void
  onCreateIssue: (issueData: Partial<Issue>) => void
  onEditIssue: (issue: Issue) => void
  onDeleteIssue: (issueId: string) => void
  onAssignToSprint: (issueId: string, sprintId: string | undefined) => void
}

import { ScopeFilters } from "@/components/scope-filters"

export function IssuesList({
  issues,
  sprints,
  projects,
  teams,
  selectedProjectIds,
  selectedTeamIds,
  onProjectsChange,
  onTeamsChange,
  onClearFilters,
  onCreateIssue,
  onEditIssue,
  onDeleteIssue,
  onAssignToSprint,
}: IssuesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all")
  const [sprintFilter, setSprintFilter] = useState<string>("all")

  const users = useSelector((state: RootState) => selectAllUsers(state))
  const userNameById: Record<string, string> = Object.fromEntries(users.map((u) => [u.id, u.name]))

  // Apply scope filters for Projects/Teams
  const scopeFilteredIssues = issues.filter((issue) => {
    const matchesProject = selectedProjectIds.length === 0 || (issue.projectId && selectedProjectIds.includes(issue.projectId))
    const matchesTeam = selectedTeamIds.length === 0 || (issue.teamId && selectedTeamIds.includes(issue.teamId))
    return matchesProject && matchesTeam
  })

  const filteredIssues = scopeFilteredIssues.filter((issue) => {
    const assigneeName = issue.assigneeUserId ? userNameById[issue.assigneeUserId] || "Unassigned" : "Unassigned"
    const lowerSearch = searchTerm.toLowerCase()
    const matchesSearch =
      issue.title.toLowerCase().includes(lowerSearch) ||
      issue.description.toLowerCase().includes(lowerSearch) ||
      assigneeName.toLowerCase().includes(lowerSearch)

    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesSprint =
      sprintFilter === "all" || (sprintFilter === "backlog" && !issue.sprintId) || issue.sprintId === sprintFilter

    return matchesSearch && matchesPriority && matchesStatus && matchesSprint
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Issues</h1>
<IssueForm
           sprints={sprints}
           projects={projects}
           teams={teams}
           onSubmit={onCreateIssue}
           defaultProjectId={selectedProjectIds[0] || "0"}
           defaultTeamId={selectedTeamIds[0] || "0"}
           trigger={
             <Button>
               <span className="mr-2">+</span>
               Create Issue
             </Button>
           }
         />
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={(value: Priority | "all") => setPriorityFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="P0">P0</SelectItem>
              <SelectItem value="P1">P1</SelectItem>
              <SelectItem value="P2">P2</SelectItem>
              <SelectItem value="P3">P3</SelectItem>
              <SelectItem value="P4">P4</SelectItem>
              <SelectItem value="P5">P5</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value: IssueStatus | "all") => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sprintFilter} onValueChange={setSprintFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredIssues.length} of {issues.length} issues
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.map((issue) => (
<IssueCard
             key={issue.id}
             issue={issue}
             sprints={sprints}
             projects={projects}
             teams={teams}
             onEdit={onEditIssue}
             onDelete={onDeleteIssue}
             onAssignToSprint={onAssignToSprint}
           />
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No issues found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
