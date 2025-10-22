import { configureStore } from "@reduxjs/toolkit"
import issuesReducer from "./slices/issuesSlice"
import sprintsReducer from "./slices/sprintsSlice"
import uiReducer from "./slices/uiSlice"
import projectsReducer from "./slices/projectsSlice"
import teamsReducer from "./slices/teamsSlice"
import preferencesReducer from "./slices/preferencesSlice"
import usersReducer from "./slices/usersSlice"
import { localStorageMiddleware, loadState } from "./middleware/localStorage"

const preloadedState = loadState()

export const store = configureStore({
  reducer: {
    issues: issuesReducer,
    sprints: sprintsReducer,
    ui: uiReducer,
    projects: projectsReducer,
    teams: teamsReducer,
    preferences: preferencesReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(localStorageMiddleware),
  preloadedState,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
