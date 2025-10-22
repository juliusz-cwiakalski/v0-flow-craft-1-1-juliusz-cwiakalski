import { combineReducers, configureStore } from "@reduxjs/toolkit"
import issuesReducer from "./slices/issuesSlice"
import sprintsReducer from "./slices/sprintsSlice"
import uiReducer from "./slices/uiSlice"
import projectsReducer from "./slices/projectsSlice"
import teamsReducer from "./slices/teamsSlice"
import preferencesReducer from "./slices/preferencesSlice"
import usersReducer from "./slices/usersSlice"
import { localStorageMiddleware, loadState } from "./middleware/localStorage"
import { demoIssues, demoProjects, demoSprints, demoTeams, demoUsers } from "@/lib/demo-data"

const rootReducer = combineReducers({
  issues: issuesReducer,
  sprints: sprintsReducer,
  ui: uiReducer,
  projects: projectsReducer,
  teams: teamsReducer,
  preferences: preferencesReducer,
  users: usersReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const loaded = loadState() as Partial<RootState> | undefined

// Build demo preloaded state if nothing is in localStorage
const demoPreloaded: Partial<RootState> = {
  users: { users: demoUsers },
  projects: { projects: demoProjects },
  teams: { teams: demoTeams },
  sprints: { sprints: demoSprints },
  issues: { issues: demoIssues },
  // Use reducers to obtain default state for these slices
  preferences: preferencesReducer(undefined, { type: "@@INIT" } as any),
  ui: uiReducer(undefined, { type: "@@INIT" } as any),
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(localStorageMiddleware),
  preloadedState: (loaded ?? demoPreloaded) as any,
})

export type AppDispatch = typeof store.dispatch
