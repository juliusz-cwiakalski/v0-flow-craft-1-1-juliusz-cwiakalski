import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { IssueTemplate, AcceptanceCriterion, Priority, IssueStatus } from "@/types"
import { demoIssueTemplates } from "@/lib/demo-data"
import { generateACId } from "@/lib/data"

export interface TemplatesState {
  templates: IssueTemplate[]
  lastUsedTemplateId?: string
}

const initialState: TemplatesState = {
  templates: demoIssueTemplates,
  lastUsedTemplateId: undefined,
}

function enforceSingleDefault(templates: IssueTemplate[], id: string): IssueTemplate[] {
  return templates.map(t => ({ ...t, isDefault: t.id === id }))
}

export const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    addTemplate(state, action: PayloadAction<IssueTemplate>) {
      state.templates.push(action.payload)
    },
    updateTemplate(state, action: PayloadAction<IssueTemplate>) {
      const idx = state.templates.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) state.templates[idx] = action.payload
    },
    deleteTemplate(state, action: PayloadAction<string>) {
      state.templates = state.templates.filter(t => t.id !== action.payload)
      if (state.lastUsedTemplateId === action.payload) state.lastUsedTemplateId = undefined
    },
    duplicateTemplate(state, action: PayloadAction<string>) {
      const orig = state.templates.find(t => t.id === action.payload)
      if (orig) {
        const copy = { ...orig, id: orig.id + "-copy", name: orig.name + " (Copy)", isDefault: false }
        state.templates.push(copy)
      }
    },
    setDefaultTemplate(state, action: PayloadAction<string>) {
      state.templates = enforceSingleDefault(state.templates, action.payload)
    },
    setLastUsedTemplateId(state, action: PayloadAction<string>) {
      state.lastUsedTemplateId = action.payload
    },
    migrateLegacyLastUsed(state, action: PayloadAction<string | undefined>) {
      if (action.payload && state.templates.some(t => t.id === action.payload)) {
        state.lastUsedTemplateId = action.payload
      }
    },
  },
})

export const {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  setDefaultTemplate,
  setLastUsedTemplateId,
  migrateLegacyLastUsed,
} = templatesSlice.actions
export default templatesSlice.reducer

// Selectors
export const selectTemplates = (state: { templates: TemplatesState }) => state.templates.templates
export const selectDefaultTemplate = (state: { templates: TemplatesState }) => state.templates.templates.find(t => t.isDefault)
export const selectLastUsedTemplateId = (state: { templates: TemplatesState }) => state.templates.lastUsedTemplateId
export const selectTemplateById = (state: { templates: TemplatesState }, id: string) => state.templates.templates.find(t => t.id === id)

// Helper to apply template defaults
export function applyTemplateDefaults(template: IssueTemplate) {
  return {
    titlePrefix: template.prefix,
    priority: template.defaults.priority as Priority,
    status: template.defaults.status as IssueStatus,
    defaultAssigneeUserId: template.defaults.defaultAssigneeUserId,
    acceptanceCriteria: template.acceptanceCriteria.map(text => ({ id: generateACId(), text, done: false })) as AcceptanceCriterion[],
  }
}
