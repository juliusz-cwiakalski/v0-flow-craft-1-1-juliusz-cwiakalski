"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Project, Team } from "@/types"

interface ScopeFiltersProps {
  projects: Project[]
  teams: Team[]
  selectedProjectIds: string[]
  selectedTeamIds: string[]
  onProjectsChange: (ids: string[]) => void
  onTeamsChange: (ids: string[]) => void
  onClearFilters: () => void
}

export function ScopeFilters({
  projects,
  teams,
  selectedProjectIds,
  selectedTeamIds,
  onProjectsChange,
  onTeamsChange,
  onClearFilters,
}: ScopeFiltersProps) {
  const hasFilters = selectedProjectIds.length > 0 || selectedTeamIds.length > 0

  const toggleProject = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      onProjectsChange(selectedProjectIds.filter((pid) => pid !== id))
    } else {
      onProjectsChange([...selectedProjectIds, id])
    }
  }

  const toggleTeam = (id: string) => {
    if (selectedTeamIds.includes(id)) {
      onTeamsChange(selectedTeamIds.filter((tid) => tid !== id))
    } else {
      onTeamsChange([...selectedTeamIds, id])
    }
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Projects:</span>
        <div className="flex gap-2">
          {projects.map((project) => {
            const isSelected = selectedProjectIds.includes(project.id)
            return (
              <Badge
                key={project.id}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                {project.name}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Teams:</span>
        <div className="flex gap-2">
          {teams.map((team) => {
            const isSelected = selectedTeamIds.includes(team.id)
            return (
              <Badge
                key={team.id}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTeam(team.id)}
              >
                {team.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
