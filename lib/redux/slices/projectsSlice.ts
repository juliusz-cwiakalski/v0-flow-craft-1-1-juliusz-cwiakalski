import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Project } from "@/types"

interface ProjectsState {
  projects: Project[]
}

const initialState: ProjectsState = {
  projects: [
    {
      id: "proj-1",
      name: "Main Project",
      createdAt: new Date("2025-01-01"),
    },
  ],
}

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    addProject(state, action: PayloadAction<Omit<Project, "id" | "createdAt">>) {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: action.payload.name,
        createdAt: new Date(),
      }
      state.projects.push(newProject)
    },
    updateProject(state, action: PayloadAction<Project>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
    },
  },
})

export const { addProject, updateProject, deleteProject } = projectsSlice.actions
export default projectsSlice.reducer
