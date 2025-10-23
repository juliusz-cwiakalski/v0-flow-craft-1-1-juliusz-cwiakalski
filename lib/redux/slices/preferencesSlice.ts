import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { PreferencesState, DashboardTimeRange } from "@/types"

const initialState: PreferencesState = {
  selectedProjectIds: [],
  selectedTeamIds: [],
  lastUsedProjectId: undefined,
  lastUsedTeamId: undefined,
  dashboardTimeRange: {
    preset: "7d",
  },
  wipThreshold: 10,
  staleAgeDays: 7,
}

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setSelectedProjects(state, action: PayloadAction<string[]>) {
      state.selectedProjectIds = action.payload
    },
    setSelectedTeams(state, action: PayloadAction<string[]>) {
      state.selectedTeamIds = action.payload
    },
    clearFilters(state) {
      state.selectedProjectIds = []
      state.selectedTeamIds = []
    },
    setLastUsedProject(state, action: PayloadAction<string | undefined>) {
      state.lastUsedProjectId = action.payload
    },
    setLastUsedTeam(state, action: PayloadAction<string | undefined>) {
      state.lastUsedTeamId = action.payload
    },
    setDashboardTimeRange(state, action: PayloadAction<DashboardTimeRange>) {
      state.dashboardTimeRange = action.payload
    },
    setWipThreshold(state, action: PayloadAction<number>) {
      state.wipThreshold = action.payload
    },
    setStaleAgeDays(state, action: PayloadAction<number>) {
      state.staleAgeDays = action.payload
    },
  },
})

export const {
  setSelectedProjects,
  setSelectedTeams,
  clearFilters,
  setLastUsedProject,
  setLastUsedTeam,
  setDashboardTimeRange,
  setWipThreshold,
  setStaleAgeDays,
} = preferencesSlice.actions
export default preferencesSlice.reducer
