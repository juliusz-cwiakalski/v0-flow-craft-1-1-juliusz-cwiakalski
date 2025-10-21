import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/types"
import type { RootState } from "../store"

interface UsersState {
  users: User[]
}

const initialState: UsersState = {
  users: [
    {
      id: "user-1",
      name: "Alice Johnson",
      email: "alice@example.com",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    {
      id: "user-2",
      name: "Bob Smith",
      email: "bob@example.com",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    {
      id: "user-3",
      name: "Carol Williams",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    {
      id: "user-4",
      name: "Charlie Brown",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    {
      id: "user-5",
      name: "Diana Prince",
      email: "diana@example.com",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
  ],
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
