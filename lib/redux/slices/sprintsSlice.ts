import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { Sprint } from "@/types"
import { initialSprints } from "@/lib/data"

interface SprintsState {
  sprints: Sprint[]
}

const initialState: SprintsState = {
  sprints: initialSprints,
}

const sprintsSlice = createSlice({
  name: "sprints",
  initialState,
  reducers: {
    addSprint(state, action: PayloadAction<Partial<Sprint>>) {
      const newSprint: Sprint = {
        id: `sprint-${Date.now()}`,
        name: action.payload.name || "",
        status: "Planned",
        startDate: action.payload.startDate || new Date(),
        endDate: action.payload.endDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.sprints.push(newSprint)
    },
    updateSprint(state, action: PayloadAction<Sprint>) {
      const index = state.sprints.findIndex((sprint) => sprint.id === action.payload.id)
      if (index !== -1) {
        state.sprints[index] = {
          ...state.sprints[index],
          ...action.payload,
          updatedAt: new Date(),
        }
      }
    },
    startSprint(state, action: PayloadAction<string>) {
      const sprint = state.sprints.find((sprint) => sprint.id === action.payload)
      if (sprint) {
        sprint.status = "Active"
        sprint.updatedAt = new Date()
      }
    },
    endSprint(state, action: PayloadAction<string>) {
      const sprint = state.sprints.find((sprint) => sprint.id === action.payload)
      if (sprint) {
        sprint.status = "Completed"
        sprint.updatedAt = new Date()
      }
    },
  },
})

export const { addSprint, updateSprint, startSprint, endSprint } = sprintsSlice.actions
export default sprintsSlice.reducer
