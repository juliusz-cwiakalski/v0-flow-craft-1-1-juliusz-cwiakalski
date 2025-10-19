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
  },
})

export const {
  setSelectedProjects,
  setSelectedTeams,
  clearFilters,
  setLastUsedProject,
  setLastUsedTeam,
  setDashboardTimeRange,
} = preferencesSlice.actions
export default preferencesSlice.reducer
