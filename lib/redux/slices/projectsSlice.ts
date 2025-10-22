import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Project, ProjectStatus } from "@/types"

interface ProjectsState {
  projects: Project[]
}

const initialState: ProjectsState = {
  projects: [
    {
      id: "proj-1",
      name: "Main Project",
      status: "Active" as ProjectStatus,
      startDate: "2025-01-01",
      members: [],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
  ],
}

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    addProject(state, action: PayloadAction<Omit<Project, "id" | "createdAt" | "updatedAt">>) {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        ...action.payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.projects.push(newProject)
    },
    updateProject(state, action: PayloadAction<Project>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = {
          ...action.payload,
          updatedAt: new Date(),
        }
      }
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
    },
    addMemberToProject(state, action: PayloadAction<{ projectId: string; userId: string }>) {
      const project = state.projects.find((p) => p.id === action.payload.projectId)
      if (project) {
        if (!project.members) project.members = []
        if (!project.members.includes(action.payload.userId)) {
          project.members.push(action.payload.userId)
          project.updatedAt = new Date()
        }
      }
    },
    removeMemberFromProject(state, action: PayloadAction<{ projectId: string; userId: string }>) {
      const project = state.projects.find((p) => p.id === action.payload.projectId)
      if (project && project.members) {
        project.members = project.members.filter((id) => id !== action.payload.userId)
        project.updatedAt = new Date()
      }
    },
  },
})

export const { addProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject } =
  projectsSlice.actions

export const addProjectMember = addMemberToProject
export const removeProjectMember = removeMemberFromProject

export default projectsSlice.reducer
