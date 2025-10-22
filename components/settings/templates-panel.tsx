"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IssueTemplate, Priority, IssueStatus } from "@/types"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  setDefaultTemplate,
  selectTemplates,
} from "@/lib/redux/slices/templatesSlice"

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3", "P4", "P5"]
const STATUSES: IssueStatus[] = ["Todo", "In Progress", "In Review", "Done"]

interface TemplateFormState {
  id: string
  name: string
  prefix: string
  priority: Priority
  status: IssueStatus
  defaultAssigneeUserId?: string
  isDefault: boolean
  acceptanceCriteria: string[]
}

function toFormState(t?: IssueTemplate): TemplateFormState {
  if (!t)
    return {
      id: "",
      name: "",
      prefix: "",
      priority: "P3",
      status: "Todo",
      defaultAssigneeUserId: undefined,
      isDefault: false,
      acceptanceCriteria: [],
    }
  return {
    id: t.id,
    name: t.name,
    prefix: t.prefix,
    priority: t.defaults.priority,
    status: t.defaults.status,
    defaultAssigneeUserId: t.defaults.defaultAssigneeUserId,
    isDefault: !!t.isDefault,
    acceptanceCriteria: [...t.acceptanceCriteria],
  }
}

function fromFormState(f: TemplateFormState): IssueTemplate {
  return {
    id: f.id.trim(),
    name: f.name.trim(),
    prefix: f.prefix,
    isDefault: f.isDefault,
    defaults: {
      priority: f.priority,
      status: f.status,
      defaultAssigneeUserId: f.defaultAssigneeUserId || undefined,
    },
    acceptanceCriteria: f.acceptanceCriteria.map(s => s.trim()).filter(Boolean),
  }
}

export function TemplatesPanel() {
  const dispatch = useDispatch<AppDispatch>()
  const templates = useSelector(selectTemplates)
  const users = useSelector((state: RootState) => state.users.users)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpenId, setEditOpenId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormState>(toFormState())
  const [error, setError] = useState<string>("")

  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users])

  const resetForm = () => {
    setForm(toFormState())
    setError("")
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openEdit = (t: IssueTemplate) => {
    setForm(toFormState(t))
    setEditOpenId(t.id)
  }

  const validate = (isEdit: boolean): boolean => {
    if (!form.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!isEdit) {
      if (!form.id.trim()) {
        setError("ID is required")
        return false
      }
      const exists = templates.some(t => t.id === form.id.trim())
      if (exists) {
        setError("ID must be unique")
        return false
      }
    }
    if (form.defaultAssigneeUserId && !userById.get(form.defaultAssigneeUserId)) {
      setError("Default assignee must be an existing user")
      return false
    }
    setError("")
    return true
  }

  const handleCreate = () => {
    if (!validate(false)) return
    const payload = fromFormState(form)
    dispatch(addTemplate(payload))
    if (payload.isDefault) dispatch(setDefaultTemplate(payload.id))
    setCreateOpen(false)
    resetForm()
  }

  const handleUpdate = () => {
    if (!editOpenId) return
    // For simplicity, do not allow changing ID during edit to avoid cascading updates
    if (!validate(true)) return
    const payload = fromFormState({ ...form, id: editOpenId })
    dispatch(updateTemplate(payload))
    if (payload.isDefault) dispatch(setDefaultTemplate(payload.id))
    setEditOpenId(null)
    resetForm()
  }

  const handleDelete = (t: IssueTemplate) => {
    const confirmed = confirm(`Delete template "${t.name}"? This cannot be undone.`)
    if (!confirmed) return

    // If deleting the default, promote another template as default to keep exactly one
    const isDefault = !!t.isDefault
    const remaining = templates.filter(x => x.id !== t.id)
    const nextDefaultId = isDefault && remaining.length > 0 ? (remaining.find(x => x.id !== t.id)?.id) : undefined

    dispatch(deleteTemplate(t.id))
    if (isDefault && nextDefaultId) dispatch(setDefaultTemplate(nextDefaultId))
  }

  const addAC = () => setForm({ ...form, acceptanceCriteria: [...form.acceptanceCriteria, ""] })
  const updateAC = (idx: number, value: string) => {
    const ac = [...form.acceptanceCriteria]
    ac[idx] = value
    setForm({ ...form, acceptanceCriteria: ac })
  }
  const removeAC = (idx: number) => {
    const ac = [...form.acceptanceCriteria]
    ac.splice(idx, 1)
    setForm({ ...form, acceptanceCriteria: ac })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Issue Templates</CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>Create Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tpl-id">ID</Label>
                    <Input id="tpl-id" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g., bug" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpl-name">Name</Label>
                    <Input id="tpl-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Template name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tpl-prefix">Title Prefix</Label>
                    <Input id="tpl-prefix" value={form.prefix} onChange={e => setForm({ ...form, prefix: e.target.value })} placeholder="e.g., [Bug] " />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Assignee</Label>
                    <Select value={form.defaultAssigneeUserId || "none"} onValueChange={v => setForm({ ...form, defaultAssigneeUserId: v === "none" ? undefined : v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as Priority })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as IssueStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Acceptance Criteria</Label>
                  <div className="space-y-2">
                    {form.acceptanceCriteria.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={c} onChange={e => updateAC(i, e.target.value)} placeholder={`Criterion #${i + 1}`} />
                        <Button variant="ghost" onClick={() => removeAC(i)}>🗑️</Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addAC}>Add criterion</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input id="tpl-default" type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                    <Label htmlFor="tpl-default">Set as default</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!form.name.trim() || !form.id.trim()}>Create</Button>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="p-3 border rounded space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{t.name}</p>
                  {t.isDefault && <Badge>Default</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">ID: {t.id} • Prefix: {t.prefix} • Priority: {t.defaults.priority} • Status: {t.defaults.status}</p>
                <p className="text-xs text-muted-foreground">Default assignee: {t.defaults.defaultAssigneeUserId ? (userById.get(t.defaults.defaultAssigneeUserId)?.name || t.defaults.defaultAssigneeUserId) : "None"}</p>
                {t.acceptanceCriteria.length > 0 && (
                  <p className="text-xs text-muted-foreground">AC: {t.acceptanceCriteria.join(" | ")}</p>
                )}
              </div>
              <div className="flex gap-2">
                {!t.isDefault && (
                  <Button variant="secondary" size="sm" onClick={() => dispatch(setDefaultTemplate(t.id))}>
                    Set Default
                  </Button>
                )}
                <Dialog open={editOpenId === t.id} onOpenChange={(open) => {
                  if (!open) {
                    setEditOpenId(null)
                    resetForm()
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>✏️</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>ID</Label>
                          <Input value={form.id} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input id="edit-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-prefix">Title Prefix</Label>
                          <Input id="edit-prefix" value={form.prefix} onChange={e => setForm({ ...form, prefix: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Assignee</Label>
                          <Select value={form.defaultAssigneeUserId || "none"} onValueChange={v => setForm({ ...form, defaultAssigneeUserId: v === "none" ? undefined : v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as Priority })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITIES.map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as IssueStatus })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Acceptance Criteria</Label>
                        <div className="space-y-2">
                          {form.acceptanceCriteria.map((c, i) => (
                            <div key={i} className="flex gap-2">
                              <Input value={c} onChange={e => updateAC(i, e.target.value)} placeholder={`Criterion #${i + 1}`} />
                              <Button variant="ghost" onClick={() => removeAC(i)}>🗑️</Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={addAC}>Add criterion</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input id="edit-default" type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                          <Label htmlFor="edit-default">Set as default</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setEditOpenId(null)}>Cancel</Button>
                          <Button onClick={handleUpdate} disabled={!form.name.trim()}>Save</Button>
                        </div>
                      </div>

                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => dispatch(duplicateTemplate(t.id))}>📄</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t)}>🗑️</Button>
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground">No templates yet. Create your first template to get started.</p>
        )}
      </CardContent>
    </Card>
  )
}
