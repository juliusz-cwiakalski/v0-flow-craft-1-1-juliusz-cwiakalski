"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Project, Team, Issue } from "@/types"

interface SettingsPanelProps {
  projects: Project[]
  teams: Team[]
  issues: Issue[]
  onAddProject: (name: string) => void
  onUpdateProject: (id: string, name: string) => void
  onDeleteProject: (id: string) => void
  onAddTeam: (name: string) => void
  onUpdateTeam: (id: string, name: string) => void
  onDeleteTeam: (id: string) => void
}

export function SettingsPanel({
  projects,
  teams,
  issues,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
}: SettingsPanelProps) {
  const [projectName, setProjectName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "project" | "team"; id: string; name: string } | null>(null)

  const handleAddProject = () => {
    if (!projectName.trim()) return
    onAddProject(projectName.trim())
    setProjectName("")
  }

  const handleAddTeam = () => {
    if (!teamName.trim()) return
    onAddTeam(teamName.trim())
    setTeamName("")
  }

  const handleUpdateProject = () => {
    if (!editingProject || !projectName.trim()) return
    onUpdateProject(editingProject.id, projectName.trim())
    setEditingProject(null)
    setProjectName("")
  }

  const handleUpdateTeam = () => {
    if (!editingTeam || !teamName.trim()) return
    onUpdateTeam(editingTeam.id, teamName.trim())
    setEditingTeam(null)
    setTeamName("")
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "project") {
      const isReferenced = issues.some((issue) => issue.projectId === deleteTarget.id)
      if (isReferenced) {
        alert(`Cannot delete project "${deleteTarget.name}" because it is referenced by one or more issues.`)
        setDeleteTarget(null)
        return
      }
      onDeleteProject(deleteTarget.id)
    } else {
      const isReferenced = issues.some((issue) => issue.teamId === deleteTarget.id)
      if (isReferenced) {
        alert(`Cannot delete team "${deleteTarget.name}" because it is referenced by one or more issues.`)
        setDeleteTarget(null)
        return
      }
      onDeleteTeam(deleteTarget.id)
    }

    setDeleteTarget(null)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingProject?.id === project.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditingProject(project)
                          setProjectName(project.name)
                        } else {
                          setEditingProject(null)
                          setProjectName("")
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ✏️
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-project-name">Project Name</Label>
                            <Input
                              id="edit-project-name"
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              placeholder="Enter project name"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingProject(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateProject} disabled={!projectName.trim()}>
                              Update
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget({ type: "project", id: project.id, name: project.name })}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="new-project">Add New Project</Label>
              <div className="flex gap-2">
                <Input
                  id="new-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddProject()
                    }
                  }}
                />
                <Button onClick={handleAddProject} disabled={!projectName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingTeam?.id === team.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditingTeam(team)
                          setTeamName(team.name)
                        } else {
                          setEditingTeam(null)
                          setTeamName("")
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ✏️
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-team-name">Team Name</Label>
                            <Input
                              id="edit-team-name"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              placeholder="Enter team name"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingTeam(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateTeam} disabled={!teamName.trim()}>
                              Update
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget({ type: "team", id: team.id, name: team.name })}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="new-team">Add New Team</Label>
              <div className="flex gap-2">
                <Input
                  id="new-team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTeam()
                    }
                  }}
                />
                <Button onClick={handleAddTeam} disabled={!teamName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === "project" ? "Project" : "Team"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              {deleteTarget && (
                <span className="block mt-2 text-sm">
                  Note: You cannot delete a {deleteTarget.type} that is referenced by any issues.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
