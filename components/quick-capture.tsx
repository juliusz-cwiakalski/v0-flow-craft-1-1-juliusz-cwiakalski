"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { ISSUE_TEMPLATES, applyIssueTemplate } from "@/lib/data"

interface QuickCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprints: Sprint[]
  onSubmit: (issueData: Partial<Issue>) => void
}

export function QuickCapture({ open, onOpenChange, sprints, onSubmit }: QuickCaptureProps) {
  const [formData, setFormData] = useState({
    title: "",
    templateId: "none" as "" | "bug" | "feature" | "request" | "none",
    priority: "P3" as Priority,
    status: "Todo" as IssueStatus,
    assignee: "",
    sprintId: "0",
  })
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriterion[]>([])
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<"bug" | "feature" | "request" | "none" | "">("")
  const [userModifiedFields, setUserModifiedFields] = useState({
    title: false,
    priority: false,
    status: false,
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        templateId: "none",
        priority: "P3",
        status: "Todo",
        assignee: "",
        sprintId: "0",
      })
      setAcceptanceCriteria([])
      setUserModifiedFields({
        title: false,
        priority: false,
        status: false,
      })
    }
  }, [open])

  const handleTemplateChange = (templateId: "" | "bug" | "feature" | "request" | "none") => {
    // If there are existing AC and switching to a different template, confirm
    if (acceptanceCriteria.length > 0 && templateId && templateId !== formData.templateId) {
      setPendingTemplateId(templateId)
      setShowTemplateConfirm(true)
      return
    }

    applyTemplate(templateId)
  }

  const applyTemplate = (templateId: "" | "bug" | "feature" | "request" | "none") => {
    if (!templateId || templateId === "none") {
      setFormData({ ...formData, templateId: "" })
      setAcceptanceCriteria([])
      return
    }

    const templateData = applyIssueTemplate(templateId)
    const template = ISSUE_TEMPLATES[templateId]

    const newFormData = { ...formData, templateId }

    // Apply prefix to title if title is empty or only contains previous prefix
    if (
      !userModifiedFields.title ||
      formData.title === "" ||
      (formData.templateId && formData.title.startsWith(ISSUE_TEMPLATES[formData.templateId].prefix))
    ) {
      newFormData.title = template.prefix
    }

    // Apply priority if user hasn't modified it
    if (!userModifiedFields.priority) {
      newFormData.priority = templateData.priority as Priority
    }

    // Apply status if user hasn't modified it
    if (!userModifiedFields.status) {
      newFormData.status = templateData.status as IssueStatus
    }

    setFormData(newFormData)
    setAcceptanceCriteria(templateData.acceptanceCriteria || [])
  }

  const handleConfirmTemplateSwitch = () => {
    if (pendingTemplateId) {
      applyTemplate(pendingTemplateId)
    }
    setShowTemplateConfirm(false)
    setPendingTemplateId("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      return
    }

    onSubmit({
      title: formData.title,
      priority: formData.priority,
      status: formData.status,
      assignee: formData.assignee || "",
      sprintId: formData.sprintId === "0" ? undefined : formData.sprintId,
      templateId: formData.templateId || undefined,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
      description: "",
    })

    onOpenChange(false)
  }

  const availableSprints = sprints.filter((s) => s.status !== "Completed")

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Capture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  setUserModifiedFields({ ...userModifiedFields, title: true })
                }}
                placeholder="Enter issue title"
                autoFocus
                maxLength={120}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => {
                    setFormData({ ...formData, priority: value })
                    setUserModifiedFields({ ...userModifiedFields, priority: true })
                  }}
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
                  onValueChange={(value: IssueStatus) => {
                    setFormData({ ...formData, status: value })
                    setUserModifiedFields({ ...userModifiedFields, status: true })
                  }}
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
                placeholder="Optional"
              />
            </div>

            {availableSprints.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="sprint">Sprint</Label>
                <Select
                  value={formData.sprintId}
                  onValueChange={(value) => setFormData({ ...formData, sprintId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Sprint (Backlog)</SelectItem>
                    {availableSprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name} ({sprint.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {acceptanceCriteria.length > 0 && (
              <div className="space-y-2">
                <Label>Acceptance Criteria (Preview)</Label>
                <div className="border rounded-md p-3 bg-muted/50 space-y-1">
                  {acceptanceCriteria.map((ac, index) => (
                    <div key={ac.id} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>{ac.text}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">Editable after creation</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.title.trim()}>
                Create Issue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching template will replace the current acceptance criteria preview. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTemplateId("")}>Keep Current</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTemplateSwitch}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
