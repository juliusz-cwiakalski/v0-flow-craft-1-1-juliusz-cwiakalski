"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
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
import {
  selectTemplates,
  selectDefaultTemplate,
  selectLastUsedTemplateId,
  setLastUsedTemplateId,
  applyTemplateDefaults,
} from "@/lib/redux/slices/templatesSlice"
import { useDispatch } from "react-redux"
import { telemetry } from "@/lib/telemetry"
import { getCurrentUser } from "@/lib/user"
import { selectAllUsers } from "@/lib/redux/slices/usersSlice"
import type { RootState } from "@/lib/redux/store"

interface QuickCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprints: Sprint[]
  onSubmit: (issueData: Partial<Issue>) => void
  sprintContext?: string // "none" | "currentSprint" | "editing:<sprintId>"
  onIssueCreated?: (issue: Issue) => void // Callback with created issue for toast
  source?: "button" | "shortcut" | "deeplink" // Add source prop for telemetry
}

export function QuickCapture({
  open,
  onOpenChange,
  sprints,
  onSubmit,
  sprintContext = "none",
  onIssueCreated,
  source = "button",
}: QuickCaptureProps) {
  const dispatch = useDispatch()
  const templates = useSelector(selectTemplates)
  const defaultTemplate = useSelector(selectDefaultTemplate)
  const lastUsedTemplateId = useSelector(selectLastUsedTemplateId)
  const { toast } = useToast()
  const users = useSelector((state: RootState) => selectAllUsers(state))
  const [formData, setFormData] = useState({
    title: "",
    templateId: "none" as string,
    priority: "P3" as Priority,
    status: "Todo" as IssueStatus,
    assigneeUserId: "0",
    sprintId: "0",
  })
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriterion[]>([])
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<string>("none")
  const [userModifiedFields, setUserModifiedFields] = useState({
    title: false,
    priority: false,
    status: false,
    assigneeUserId: false,
  })
  const [isDirty, setIsDirty] = useState(false)
  const openTimeRef = useRef<number>(0)

  useEffect(() => {
    if (open) {
      openTimeRef.current = Date.now()
      telemetry.track("quick_capture_opened", {
        source,
      })

      const initialTemplateId =
        lastUsedTemplateId && templates.some(t => t.id === lastUsedTemplateId)
          ? lastUsedTemplateId
          : defaultTemplate?.id || "none"
      const initialTemplateObj = templates.find(t => t.id === initialTemplateId)

      let prefillSprintId = "0"
      if (sprintContext === "currentSprint") {
        const activeSprint = sprints.find((s) => s.status === "Active")
        if (activeSprint) {
          prefillSprintId = activeSprint.id
        }
      } else if (sprintContext.startsWith("editing:")) {
        const sprintId = sprintContext.replace("editing:", "")
        prefillSprintId = sprintId
      }

      if (initialTemplateObj) {
        const templateData = applyTemplateDefaults(initialTemplateObj)
        setFormData({
          title: templateData.titlePrefix,
          templateId: initialTemplateObj.id,
          priority: templateData.priority,
          status: templateData.status,
          assigneeUserId: templateData.defaultAssigneeUserId || "0",
          sprintId: prefillSprintId,
        })
        setAcceptanceCriteria(templateData.acceptanceCriteria || [])
      } else {
        setFormData({
          title: "",
          templateId: "none",
          priority: "P3",
          status: "Todo",
          assigneeUserId: "0",
          sprintId: prefillSprintId,
        })
        setAcceptanceCriteria([])
      }

      setUserModifiedFields({
        title: false,
        priority: false,
        status: false,
        assigneeUserId: false,
      })
      setIsDirty(false)
    }
  }, [open, sprintContext, sprints, source, defaultTemplate?.id, lastUsedTemplateId, templates])

  useEffect(() => {
    const hasContent = formData.title.trim() !== "" || acceptanceCriteria.length > 0
    setIsDirty(hasContent)
  }, [formData.title, acceptanceCriteria])

  const handleTemplateChange = (templateId: string) => {
    const hasConflicts =
      userModifiedFields.title ||
      userModifiedFields.priority ||
      userModifiedFields.status ||
      acceptanceCriteria.length > 0

    if (hasConflicts && templateId !== "none" && templateId !== formData.templateId) {
      setPendingTemplateId(templateId)
      setShowTemplateConfirm(true)
      return
    }

    applyTemplate(templateId, false)
  }

  const applyTemplate = (templateId: string, forceOverwrite = false) => {
    if (templateId === "none") {
      setFormData({ ...formData, templateId: "none" })
      setAcceptanceCriteria([])
      return
    }

    telemetry.track("template_selected", { templateId })

    const templateObj = templates.find(t => t.id === templateId)
    if (!templateObj) {
      setFormData({ ...formData, templateId })
      setAcceptanceCriteria([])
      return
    }
    const templateData = applyTemplateDefaults(templateObj)

    const newFormData = { ...formData, templateId }

    if (forceOverwrite || !userModifiedFields.title || formData.title === "") {
      newFormData.title = templateData.titlePrefix
    }

    if (forceOverwrite || !userModifiedFields.priority) {
      newFormData.priority = templateData.priority as Priority
    }

    if (forceOverwrite || !userModifiedFields.status) {
      newFormData.status = templateData.status as IssueStatus
    }

    if ((forceOverwrite || !userModifiedFields.assigneeUserId) && formData.assigneeUserId === "0") {
      newFormData.assigneeUserId = templateData.defaultAssigneeUserId || "0"
    }

    setFormData(newFormData)

    if (forceOverwrite || acceptanceCriteria.length === 0) {
      setAcceptanceCriteria(templateData.acceptanceCriteria || [])
    }
  }

  const handleConfirmTemplateSwitch = (overwrite: boolean) => {
    if (pendingTemplateId !== "none") {
      applyTemplate(pendingTemplateId, overwrite)
    }
    setShowTemplateConfirm(false)
    setPendingTemplateId("none")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      return
    }

    if (formData.templateId !== "none") {
      dispatch(setLastUsedTemplateId(formData.templateId))
    }

    let finalAssigneeUserId = formData.assigneeUserId !== "0" ? formData.assigneeUserId : ""
    if (!finalAssigneeUserId && formData.templateId !== "none") {
      const templateObj = templates.find(t => t.id === formData.templateId)
      finalAssigneeUserId = templateObj?.defaults.defaultAssigneeUserId || ""
      if (finalAssigneeUserId) {
        telemetry.track("assignee_autofilled", { source: "template" })
      }
    }
    if (!finalAssigneeUserId) {
      const currentUser = getCurrentUser()
      finalAssigneeUserId = currentUser.id
      telemetry.track("assignee_autofilled", { source: "currentUser" })
    }

    const issueData: Partial<Issue> = {
      title: formData.title,
      priority: formData.priority,
      status: formData.status,
      assigneeUserId: finalAssigneeUserId || undefined,
      sprintId: formData.sprintId === "0" ? undefined : formData.sprintId,
      templateId: formData.templateId === "none" ? undefined : formData.templateId,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
      description: "",
    }

    const timeToCreateMs = Date.now() - openTimeRef.current
    telemetry.track("issue_created_via_quick_capture", {
      timeToCreateMs,
      fieldsUsed: {
        template: !!issueData.templateId,
        assignee: !!issueData.assigneeUserId,
        priority: issueData.priority !== "P3",
        status: issueData.status !== "Todo",
        sprint: !!issueData.sprintId,
      },
      acCount: acceptanceCriteria.length,
    })

    onSubmit(issueData)

    const currentTemplateId = formData.templateId

    if (currentTemplateId !== "none") {
      // Re-apply the same template to get fresh defaults
      const templateObj = templates.find(t => t.id === currentTemplateId)
      const templateData = templateObj ? applyTemplateDefaults(templateObj) : undefined

      setFormData({
        title: templateData ? templateData.titlePrefix : "",
        templateId: currentTemplateId,
        priority: templateData?.priority || "P3",
        status: templateData?.status || "Todo",
        assigneeUserId: "0",
        sprintId: formData.sprintId, // Keep the same sprint context
      })
      setAcceptanceCriteria(templateData?.acceptanceCriteria || [])
    } else {
      // No template, just clear the title
      setFormData({
        ...formData,
        title: "",
        assigneeUserId: "0",
      })
      setAcceptanceCriteria([])
    }

    // Reset user modification tracking
    setUserModifiedFields({
      title: false,
      priority: false,
      status: false,
      assigneeUserId: false,
    })
    setIsDirty(false)

    // Reset timer for next issue
    openTimeRef.current = Date.now()
  }

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false)
    onOpenChange(false)
  }

  const availableSprints = sprints.filter((s) => s.status !== "Completed")

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-[500px]"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleClose()
          }}
        >
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
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
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
              <Label htmlFor="assigneeUserId">Assignee</Label>
              <Select
                value={formData.assigneeUserId}
                onValueChange={(value) => {
                  setFormData({ ...formData, assigneeUserId: value })
                  setUserModifiedFields({ ...userModifiedFields, assigneeUserId: true })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional (defaults to current user)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button type="button" variant="outline" onClick={handleClose}>
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
              You have made changes to some fields. Do you want to overwrite them with the new template defaults, or
              keep your current values?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                handleConfirmTemplateSwitch(false)
              }}
            >
              Keep My Values
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmTemplateSwitch(true)}>
              Overwrite with Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without creating the issue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
