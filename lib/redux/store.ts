import { combineReducers, configureStore } from "@reduxjs/toolkit"
import issuesReducer from "./slices/issuesSlice"
import sprintsReducer from "./slices/sprintsSlice"
import uiReducer from "./slices/uiSlice"
import projectsReducer from "./slices/projectsSlice"
import teamsReducer from "./slices/teamsSlice"
import preferencesReducer from "./slices/preferencesSlice"
import usersReducer from "./slices/usersSlice"
import { localStorageMiddleware, loadState } from "./middleware/localStorage"

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

const preloaded = loadState() as Partial<RootState> | undefined

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(localStorageMiddleware),
  preloadedState: preloaded as any,
})

export type AppDispatch = typeof store.dispatch
