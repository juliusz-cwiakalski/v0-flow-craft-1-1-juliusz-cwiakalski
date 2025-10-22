import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/types"
import type { RootState } from "../store"
import { demoUsers } from "@/lib/demo-data"

interface UsersState {
  users: User[]
}

const initialState: UsersState = {
  users: demoUsers,
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<Omit<User, "id" | "createdAt" | "updatedAt">>) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.users.push(newUser)
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.users.findIndex((u) => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = {
          ...action.payload,
          updatedAt: new Date(),
        }
      }
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((u) => u.id !== action.payload)
    },
  },
})

export const { addUser, updateUser, deleteUser } = usersSlice.actions

// Selectors
export const selectAllUsers = (state: RootState) => state.users.users
export const selectUserById = (state: RootState, userId: string) => state.users.users.find((u) => u.id === userId)
export const searchUsers = (state: RootState, query: string) => {
  const lowerQuery = query.toLowerCase()
  return state.users.users.filter(
    (u) => u.name.toLowerCase().includes(lowerQuery) || (u.email && u.email.toLowerCase().includes(lowerQuery)),
  )
}

export default usersSlice.reducer
