import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Team } from "@/types"
import { demoTeams } from "@/lib/demo-data"

interface TeamsState {
  teams: Team[]
}

const initialState: TeamsState = {
  teams: demoTeams,
}

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    addTeam(state, action: PayloadAction<Omit<Team, "id" | "createdAt" | "updatedAt">>) {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        ...action.payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.teams.push(newTeam)
    },
    updateTeam(state, action: PayloadAction<Team>) {
      const index = state.teams.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.teams[index] = {
          ...action.payload,
          updatedAt: new Date(),
        }
      }
    },
    deleteTeam(state, action: PayloadAction<string>) {
      state.teams = state.teams.filter((t) => t.id !== action.payload)
    },
    addMemberToTeam(state, action: PayloadAction<{ teamId: string; userId: string }>) {
      const team = state.teams.find((t) => t.id === action.payload.teamId)
      if (team) {
        if (!team.members) team.members = []
        if (!team.members.includes(action.payload.userId)) {
          team.members.push(action.payload.userId)
          team.updatedAt = new Date()
        }
      }
    },
    removeMemberFromTeam(state, action: PayloadAction<{ teamId: string; userId: string }>) {
      const team = state.teams.find((t) => t.id === action.payload.teamId)
      if (team && team.members) {
        team.members = team.members.filter((id) => id !== action.payload.userId)
        team.updatedAt = new Date()
      }
    },
  },
})

export const { addTeam, updateTeam, deleteTeam, addMemberToTeam, removeMemberFromTeam } = teamsSlice.actions
export default teamsSlice.reducer
