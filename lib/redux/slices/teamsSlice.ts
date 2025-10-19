import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Team } from "@/types"

interface TeamsState {
  teams: Team[]
}

const initialState: TeamsState = {
  teams: [
    {
      id: "team-1",
      name: "Main Team",
      createdAt: new Date("2025-01-01"),
    },
  ],
}

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    addTeam(state, action: PayloadAction<Omit<Team, "id" | "createdAt">>) {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: action.payload.name,
        createdAt: new Date(),
      }
      state.teams.push(newTeam)
    },
    updateTeam(state, action: PayloadAction<Team>) {
      const index = state.teams.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.teams[index] = action.payload
      }
    },
    deleteTeam(state, action: PayloadAction<string>) {
      state.teams = state.teams.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addTeam, updateTeam, deleteTeam } = teamsSlice.actions
export default teamsSlice.reducer
