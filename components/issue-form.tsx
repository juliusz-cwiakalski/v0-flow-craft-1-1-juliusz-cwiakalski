"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { Issue, Priority, IssueStatus, Sprint, AcceptanceCriterion } from "@/types"
import { ISSUE_TEMPLATES, applyIssueTemplate, generateACId } from "@/lib/data"

interface IssueFormProps {
  issue?: Issue
  sprints: Sprint[]
  onSubmit: (issueData: Partial<Issue>) => void
  trigger?: React.ReactNode
}

export function IssueForm({ issue, sprints, onSubmit, trigger }: IssueFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: issue?.title || "",
    description: issue?.description || "",
    priority: issue?.priority || ("P3" as Priority),
    status: issue?.status || ("Todo" as IssueStatus),
    assignee: issue?.assignee || "",
    sprintId: issue?.sprintId || "0",
    templateId: issue?.templateId || ("none" as "none" | "bug" | "feature" | "request"), // Changed default from "" to "none"
  })
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriterion[]>(issue?.acceptanceCriteria || [])
  const [newACText, setNewACText] = useState("")
  const [deleteACId, setDeleteACId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        title: issue?.title || "",
        description: issue?.description || "",
        priority: issue?.priority || "P3",
        status: issue?.status || "Todo",
        assignee: issue?.assignee || "",
        sprintId: issue?.sprintId || "0",
        templateId: issue?.templateId || "none", // Changed default from "" to "none"
      })
      setAcceptanceCriteria(issue?.acceptanceCriteria || [])
      setNewACText("")
      setErrors({})
    }
  }, [open, issue])

  const handleTemplateChange = (templateId: "none" | "bug" | "feature" | "request") => {
    // Changed "" to "none"
    if (templateId === "none") {
      // Changed check from !templateId to === "none"
      setFormData({ ...formData, templateId: "none" }) // Changed from "" to "none"
      return
    }

    const templateData = applyIssueTemplate(templateId)
    const template = ISSUE_TEMPLATES[templateId]

    setFormData({
      ...formData,
      templateId,
      title: formData.title || template.prefix,
      priority: templateData.priority as Priority,
      status: templateData.status as IssueStatus,
    })
    setAcceptanceCriteria(templateData.acceptanceCriteria || [])
  }

  const handleAddAC = () => {
    if (!newACText.trim() || acceptanceCriteria.length >= 10) return

    setAcceptanceCriteria([
      ...acceptanceCriteria,
      {
        id: generateACId(),
        text: newACText.trim(),
        done: false,
      },
    ])
    setNewACText("")
  }

  const handleToggleAC = (id: string) => {
    setAcceptanceCriteria(acceptanceCriteria.map((ac) => (ac.id === id ? { ...ac, done: !ac.done } : ac)))
  }

  const handleDeleteAC = (id: string) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((ac) => ac.id !== id))
    setDeleteACId(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.assignee.trim()) {
      newErrors.assignee = "Assignee is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      ...formData,
      sprintId: formData.sprintId === "0" ? undefined : formData.sprintId,
      templateId: formData.templateId === "none" ? undefined : formData.templateId, // Changed check from || undefined
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
    })

    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger || <Button>Create Issue</Button>}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{issue ? "Edit Issue" : "Create New Issue"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!issue && (
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter issue title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter issue description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 - Critical</SelectItem>
                    <SelectItem value="P1">P1 - High</SelectItem>
                    <SelectItem value="P2">P2 - Medium</SelectItem>
                    <SelectItem value="P3">P3 - Normal</SelectItem>
                    <SelectItem value="P4">P4 - Low</SelectItem>
                    <SelectItem value="P5">P5 - Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: IssueStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Enter assignee name"
                className={errors.assignee ? "border-red-500" : ""}
              />
              {errors.assignee && <p className="text-sm text-red-500">{errors.assignee}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint (Optional)</Label>
              <Select
                value={formData.sprintId}
                onValueChange={(value) => setFormData({ ...formData, sprintId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Sprint (Backlog)</SelectItem>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id} disabled={sprint.status === "Completed"}>
                      {sprint.name} ({sprint.status}){sprint.status === "Completed" && " - Cannot assign"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Acceptance Criteria</Label>
              <div className="border rounded-md p-3 space-y-2">
                {acceptanceCriteria.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No acceptance criteria yet</p>
                ) : (
                  <div className="space-y-2">
                    {acceptanceCriteria.map((ac) => (
                      <div key={ac.id} className="flex items-start gap-2 group">
                        <Checkbox checked={ac.done} onCheckedChange={() => handleToggleAC(ac.id)} className="mt-1" />
                        <span className={`flex-1 text-sm ${ac.done ? "line-through text-muted-foreground" : ""}`}>
                          {ac.text}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => setDeleteACId(ac.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {acceptanceCriteria.length < 10 && (
                  <div className="flex gap-2 pt-2">
                    <Input
                      value={newACText}
                      onChange={(e) => setNewACText(e.target.value)}
                      placeholder="Add acceptance criterion"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAC()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAC}
                      disabled={!newACText.trim()}
                    >
                      Add
                    </Button>
                  </div>
                )}

                {acceptanceCriteria.length >= 10 && (
                  <p className="text-xs text-muted-foreground">Maximum 10 criteria reached</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{issue ? "Update Issue" : "Create Issue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteACId} onOpenChange={(open) => !open && setDeleteACId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Acceptance Criterion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this acceptance criterion from the issue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteACId && handleDeleteAC(deleteACId)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
