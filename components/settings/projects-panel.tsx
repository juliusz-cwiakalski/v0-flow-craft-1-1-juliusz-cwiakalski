"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import type { Project, ProjectStatus } from "@/types"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import {
  addProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "@/lib/redux/slices/projectsSlice"

export function ProjectsPanel() {
  const dispatch = useDispatch<AppDispatch>()
  const projects = useSelector((state: RootState) => state.projects.projects)
  const issues = useSelector((state: RootState) => state.issues.issues)
  const users = useSelector((state: RootState) => state.users.users)

  const [projectName, setProjectName] = useState("")
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("Planned")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [memberSearch, setMemberSearch] = useState("")

  const handleAddProject = () => {
    if (!projectName.trim()) return
    dispatch(
      addProject({
        name: projectName.trim(),
        status: projectStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    )
    setProjectName("")
    setProjectStatus("Planned")
    setStartDate("")
    setEndDate("")
  }

  const handleUpdateProject = () => {
    if (!editingProject || !projectName.trim()) return
    dispatch(
      updateProject({
        ...editingProject,
        name: projectName.trim(),
        status: projectStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    )
    setEditingProject(null)
    setProjectName("")
    setProjectStatus("Planned")
    setStartDate("")
    setEndDate("")
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    const isReferenced = issues.some((issue) => issue.projectId === deleteTarget.id)
    if (isReferenced) {
      alert(`Cannot delete project "${deleteTarget.name}" because it is referenced by one or more issues.`)
      setDeleteTarget(null)
      return
    }
    dispatch(deleteProject(deleteTarget.id))
    setDeleteTarget(null)
  }

  const getAvailableUsers = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    const assignedIds = project?.members || []
    return users.filter((u) => !assignedIds.includes(u.id))
  }

  const getFilteredUsers = (projectId: string) => {
    const available = getAvailableUsers(projectId)
    if (!memberSearch) return available
    const query = memberSearch.toLowerCase()
    return available.filter(
      (u) => u.name.toLowerCase().includes(query) || (u.email && u.email.toLowerCase().includes(query)),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="p-3 border rounded space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{project.name}</p>
                    <Badge variant={project.status === "Active" ? "default" : "secondary"}>{project.status}</Badge>
                  </div>
                  {project.startDate && (
                    <p className="text-xs text-muted-foreground">
                      Start: {new Date(project.startDate).toLocaleDateString()}
                      {project.endDate && ` • End: ${new Date(project.endDate).toLocaleDateString()}`}
                    </p>
                  )}
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
                        setProjectStatus(project.status)
                        setStartDate(project.startDate || "")
                        setEndDate(project.endDate || "")
                      } else {
                        setEditingProject(null)
                        setProjectName("")
                        setProjectStatus("Planned")
                        setStartDate("")
                        setEndDate("")
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        ✏️
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
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
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-status">Status</Label>
                          <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus)}>
                            <SelectTrigger id="edit-project-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Planned">Planned</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="On Hold">On Hold</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-start-date">Start Date</Label>
                            <Input
                              id="edit-start-date"
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-end-date">End Date</Label>
                            <Input
                              id="edit-end-date"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
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
                    onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Members Section */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm">Members ({project.members?.length || 0})</Label>
                <div className="flex flex-wrap gap-1">
                  {project.members?.map((userId) => {
                    const user = users.find((u) => u.id === userId)
                    return user ? (
                      <Badge key={userId} variant="outline" className="gap-1">
                        {user.name}
                        <button
                          onClick={() => dispatch(removeProjectMember({ projectId: project.id, userId }))}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search users to add..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {memberSearch && (
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                    {getFilteredUsers(project.id).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          dispatch(addProjectMember({ projectId: project.id, userId: user.id }))
                          setMemberSearch("")
                        }}
                        className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                      >
                        <div className="font-medium">{user.name}</div>
                        {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                      </button>
                    ))}
                    {getFilteredUsers(project.id).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No users found</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="new-project">Add New Project</Label>
          <div className="space-y-2">
            <Input
              id="new-project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
            />
            <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" />
            </div>
            <Button onClick={handleAddProject} disabled={!projectName.trim()} className="w-full">
              Add Project
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              <span className="block mt-2 text-sm">
                Note: You cannot delete a project that is referenced by any issues.
              </span>
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
    </Card>
  )
}
